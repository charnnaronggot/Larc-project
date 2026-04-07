import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const settingsSchema = z.object({
  port: z.number().int().positive(),
  maxFileSizeMB: z.number().int().positive().default(10),
  uploadsFolder: z.string().min(1),
  fontsFolder: z.string().min(1),
  defaultFontSize: z.number().positive().default(16),
  logLevel: z.string().default('info')
});

export type AppSettings = z.infer<typeof settingsSchema> & {
  maxFileSizeBytes: number;
  uploadsDir: string;
  fontsDir: string;
};

type RawAppSettings = {
  Server?: {
    Port?: number;
  };
  PdfSettings?: {
    MaxFileSizeMB?: number;
    UploadsFolder?: string;
    FontsFolder?: string;
    DefaultFontSize?: number;
  };
  Logging?: {
    Level?: string;
  };
};

const loadRawSettings = (rootDir: string): RawAppSettings => {
  const appSettingsPath = path.resolve(rootDir, 'config', 'appsettings.json');
  if (!fs.existsSync(appSettingsPath)) {
    return {};
  }

  const raw = fs.readFileSync(appSettingsPath, 'utf8');
  return JSON.parse(raw) as RawAppSettings;
};

export const loadSettings = (rootDir: string): AppSettings => {
  const rawSettings = loadRawSettings(rootDir);

  const parsed = settingsSchema.parse({
    port: Number(process.env.PORT ?? rawSettings.Server?.Port ?? 3000),
    maxFileSizeMB: Number(
      process.env.PDF_MAX_FILE_SIZE_MB ?? rawSettings.PdfSettings?.MaxFileSizeMB ?? 10
    ),
    uploadsFolder: process.env.PDF_UPLOADS_FOLDER ?? rawSettings.PdfSettings?.UploadsFolder ?? 'uploads',
    fontsFolder: process.env.PDF_FONTS_FOLDER ?? rawSettings.PdfSettings?.FontsFolder ?? 'Fonts',
    defaultFontSize: Number(
      process.env.PDF_DEFAULT_FONT_SIZE ?? rawSettings.PdfSettings?.DefaultFontSize ?? 16
    ),
    logLevel: process.env.LOG_LEVEL ?? rawSettings.Logging?.Level ?? 'info'
  });

  const uploadsDir = path.resolve(rootDir, parsed.uploadsFolder);
  const fontsDir = path.resolve(rootDir, parsed.fontsFolder);

  return {
    ...parsed,
    uploadsDir,
    fontsDir,
    maxFileSizeBytes: parsed.maxFileSizeMB * 1024 * 1024
  };
};
