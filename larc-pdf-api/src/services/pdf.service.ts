import fs from 'node:fs';
import path from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField
} from 'pdf-lib';
import { AppError } from '../middleware/app-error';
import type { RowData } from '../utils/data-parser';
import { loadPreferredFont } from '../utils/font-loader';

export type PdfMetadata = {
  title: string | null;
  author: string | null;
  pageCount: number;
  creationDate: string | null;
  fileSize: number;
};

const toText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

const isTruthy = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y';
};

const containsNonLatinText = (value: string): boolean => {
  for (const char of value) {
    if (char.charCodeAt(0) > 0xff) {
      return true;
    }
  }
  return false;
};

export class PdfService {
  public async getMetadata(filePath: string): Promise<PdfMetadata> {
    const bytes = fs.readFileSync(filePath);
    const stat = fs.statSync(filePath);
    const pdfDoc = await PDFDocument.load(bytes);

    return {
      title: pdfDoc.getTitle() ?? null,
      author: pdfDoc.getAuthor() ?? null,
      pageCount: pdfDoc.getPageCount(),
      creationDate: pdfDoc.getCreationDate()?.toISOString() ?? null,
      fileSize: stat.size
    };
  }

  public async createPreviewPdf(options: {
    templateBuffer: Buffer;
    rows: RowData[];
    fontSize: number;
    fontsDir: string;
  }): Promise<{ pdf: Buffer; rowsProcessed: number }> {
    const generated = await Promise.all(
      options.rows.map((row) =>
        this.fillSinglePdf({
          templateBuffer: options.templateBuffer,
          row,
          fontSize: options.fontSize,
          fontsDir: options.fontsDir
        })
      )
    );

    if (generated.length === 0) {
      throw new AppError('No rows processed from data file.', 400);
    }

    if (generated.length === 1) {
      return { pdf: generated[0], rowsProcessed: 1 };
    }

    const merged = await this.mergePdfs(generated);
    return { pdf: merged, rowsProcessed: generated.length };
  }

  private async fillSinglePdf(options: {
    templateBuffer: Buffer;
    row: RowData;
    fontSize: number;
    fontsDir: string;
  }): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(options.templateBuffer);
    pdfDoc.registerFontkit(fontkit);

    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const preferredFont = await loadPreferredFont(pdfDoc, options.fontsDir);

    if (preferredFont) {
      // Prime appearances with unicode-capable font to avoid WinAnsi fallback.
      form.updateFieldAppearances(preferredFont);
    }

    for (const field of fields) {
      const fieldName = field.getName();
      if (!(fieldName in options.row)) {
        continue;
      }

      const value = options.row[fieldName];
      if (field instanceof PDFTextField) {
        const textValue = toText(value);
        if (!preferredFont && containsNonLatinText(textValue)) {
          throw new AppError(
            `Field "${fieldName}" contains non-Latin text but no Unicode font could be loaded from ${options.fontsDir}.`,
            400
          );
        }

        const maxLength = field.getMaxLength();

        if (typeof maxLength === 'number' && maxLength >= 0 && textValue.length > maxLength) {
          field.setText(textValue.slice(0, maxLength));
        } else {
          field.setText(textValue);
        }
        field.setFontSize(options.fontSize);
      } else if (field instanceof PDFCheckBox) {
        if (isTruthy(value)) {
          field.check();
        } else {
          field.uncheck();
        }
      } else if (field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) {
        try {
          field.select(toText(value));
        } catch {
          // Ignore values that are not in the field option list.
        }
      }
    }

    if (preferredFont) {
      form.updateFieldAppearances(preferredFont);
    } else {
      form.updateFieldAppearances();
    }

    form.flatten();

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }

  private async mergePdfs(pdfs: Buffer[]): Promise<Buffer> {
    const output = await PDFDocument.create();

    for (const pdfBytes of pdfs) {
      const source = await PDFDocument.load(pdfBytes);
      const copiedPages = await output.copyPages(source, source.getPageIndices());
      for (const page of copiedPages) {
        output.addPage(page);
      }
    }

    const merged = await output.save();
    return Buffer.from(merged);
  }

  public ensurePdfExtension(fileName: string): void {
    if (path.extname(fileName).toLowerCase() !== '.pdf') {
      throw new AppError('Only PDF files are allowed.', 400);
    }
  }
}
