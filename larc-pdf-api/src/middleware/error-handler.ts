import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { AppError } from './app-error';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ success: false, message: 'File too large.' });
      return;
    }

    res.status(400).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
    return;
  }

  res.status(500).json({ success: false, message: 'Internal server error.' });
};
