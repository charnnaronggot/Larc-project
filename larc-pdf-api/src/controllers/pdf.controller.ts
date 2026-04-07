import fs from 'node:fs';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/app-error';
import { parseDataFile } from '../utils/data-parser';
import { generateFileId } from '../utils/id';
import { FileMapService } from '../services/file-map.service';
import { PdfService } from '../services/pdf.service';
import type { AppSettings } from '../config/settings';
import { createUploadMiddleware } from '../middleware/upload';

const previewBodySchema = z.object({
  fontSize: z.coerce.number().positive().optional()
});

/**
 * @openapi
 * /api/pdf/upload:
 *   post:
 *     summary: Upload a PDF file
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload result
 */
/**
 * @openapi
 * /api/pdf/metadata/{fileId}:
 *   get:
 *     summary: Get PDF metadata by fileId
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Metadata result
 */
/**
 * @openapi
 * /api/pdf/{fileId}:
 *   delete:
 *     summary: Delete a PDF by fileId
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete result
 */
/**
 * @openapi
 * /api/pdf/preview-form:
 *   post:
 *     summary: Fill PDF form from CSV/JSON and return generated PDF
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdfFile:
 *                 type: string
 *                 format: binary
 *               data:
 *                 type: string
 *                 format: binary
 *               fontSize:
 *                 type: number
 *     responses:
 *       200:
 *         description: Generated PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */

export const createPdfRouter = (settings: AppSettings): Router => {
  const router = Router();
  const fileMapService = new FileMapService();
  const pdfService = new PdfService();
  const upload = createUploadMiddleware(settings);

  router.post('/upload', upload.uploadPdf.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded.', 400);
      }

      if (!req.file.path) {
        throw new AppError('Uploaded file path is missing.', 500);
      }

      pdfService.ensurePdfExtension(req.file.originalname);

      const fileId = generateFileId();
      fileMapService.set({ fileId, filePath: req.file.path });

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully.',
        filePath: req.file.path,
        fileId
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/metadata/:fileId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileId } = req.params;
      const filePath = fileMapService.get(fileId);

      if (!filePath || !fs.existsSync(filePath)) {
        throw new AppError('File not found.', 404);
      }

      const metadata = await pdfService.getMetadata(filePath);

      res.status(200).json({
        success: true,
        message: 'Metadata retrieved successfully.',
        ...metadata
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileId } = req.params;
      const filePath = fileMapService.get(fileId);

      if (!filePath) {
        throw new AppError('File not found.', 404);
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      fileMapService.delete(fileId);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  });

  router.post(
    '/preview-form',
    upload.uploadPreview.fields([
      { name: 'pdfFile', maxCount: 1 },
      { name: 'data', maxCount: 1 }
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const files = req.files as Record<string, Express.Multer.File[]> | undefined;
        const pdfFile = files?.pdfFile?.[0];
        const dataFile = files?.data?.[0];

        if (!pdfFile) {
          throw new AppError('pdfFile is required.', 400);
        }

        if (!dataFile) {
          throw new AppError('data is required.', 400);
        }

        pdfService.ensurePdfExtension(pdfFile.originalname);

        const parsedBody = previewBodySchema.parse(req.body);
        const fontSize = parsedBody.fontSize ?? settings.defaultFontSize;
        const rows = parseDataFile(dataFile);
        console.log(`Parsed ${rows.length} rows from data file.` , rows);
        const result = await pdfService.createPreviewPdf({
          templateBuffer: pdfFile.buffer,
          rows,
          fontSize,
          fontsDir: settings.fontsDir
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="preview.pdf"');
        res.setHeader('X-Rows-Processed', String(result.rowsProcessed));
        res.status(200).send(result.pdf);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};
