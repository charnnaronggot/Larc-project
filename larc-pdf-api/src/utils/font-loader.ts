import fs from 'node:fs';
import path from 'node:path';
import type { PDFDocument, PDFFont } from 'pdf-lib';

const FONT_EXTENSIONS = new Set(['.ttf', '.otf']);
const FONT_PRIORITY_HINTS = ['thai', 'sarabun', 'noto', 'arialuni', 'th'];

const compareFonts = (a: string, b: string): number => {
  const aScore = FONT_PRIORITY_HINTS.some((hint) => a.toLowerCase().includes(hint)) ? 1 : 0;
  const bScore = FONT_PRIORITY_HINTS.some((hint) => b.toLowerCase().includes(hint)) ? 1 : 0;
  return bScore - aScore || a.localeCompare(b);
};

export const loadPreferredFont = async (
  pdfDoc: PDFDocument,
  fontsDir: string
): Promise<PDFFont | undefined> => {
  if (!fs.existsSync(fontsDir)) {
    return undefined;
  }

  const candidates = fs
    .readdirSync(fontsDir)
    .filter((name) => FONT_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort(compareFonts);
  console.log(`Found ${candidates.length} font candidates in "${fontsDir}":`, candidates);
  for (const fileName of candidates) {
    const fullPath = path.join(fontsDir, fileName);
    const bytes = fs.readFileSync(fullPath);
    try {
      const font = await pdfDoc.embedFont(bytes, { subset: true });
      return font;
    } catch {
      // Try next font candidate.
    }
  }

  return undefined;
};
