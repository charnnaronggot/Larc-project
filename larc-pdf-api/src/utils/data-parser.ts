import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { AppError } from '../middleware/app-error';
import { parseConcatenatedJsonObjects } from './json-stream-parser';

export type RowData = Record<string, unknown>;

const normalizeJsonToRows = (value: unknown): RowData[] => {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        throw new AppError('JSON array items must be objects.', 400);
      }
      return item as RowData;
    });
  }

  if (value && typeof value === 'object') {
    return [value as RowData];
  }

  throw new AppError('JSON payload must be an object or an array of objects.', 400);
};

const parseCsv = (content: string): RowData[] => {
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true
  }) as RowData[];

  if (rows.length === 0) {
    throw new AppError('CSV data has no rows.', 400);
  }

  return rows;
};

export const parseDataFile = (file: Express.Multer.File): RowData[] => {
  const content = file.buffer.toString('utf8').trim();
  const ext = path.extname(file.originalname).toLowerCase();

  if (!content) {
    throw new AppError('Data file is empty.', 400);
  }

  if (ext === '.csv') {
    return parseCsv(content);
  }

  if (ext === '.json' || file.mimetype.includes('json') || content.startsWith('{') || content.startsWith('[')) {
    try {
      return normalizeJsonToRows(JSON.parse(content));
    } catch {
      return parseConcatenatedJsonObjects(content);
    }
  }

  throw new AppError('Unsupported data format. Please upload CSV or JSON.', 400);
};
