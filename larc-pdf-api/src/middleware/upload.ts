import fs from 'node:fs';
import path from 'node:path';
import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import type { AppSettings } from '../config/settings';

const pdfFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const isPdf = path.extname(file.originalname).toLowerCase() === '.pdf';
  if (!isPdf) {
    cb(new Error('Only PDF files are allowed.'));
    return;
  }

  cb(null, true);
};

export const createUploadMiddleware = (settings: AppSettings) => {
  fs.mkdirSync(settings.uploadsDir, { recursive: true });

  const uploadPdf = multer({
    storage: multer.diskStorage({
      destination: settings.uploadsDir,
      filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
      }
    }),
    limits: {
      fileSize: settings.maxFileSizeBytes
    },
    fileFilter: pdfFilter
  });

  const uploadPreview = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: settings.maxFileSizeBytes
    }
  });

  return {
    uploadPdf,
    uploadPreview
  };
};
