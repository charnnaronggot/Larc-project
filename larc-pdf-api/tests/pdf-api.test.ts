import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import type { AppSettings } from '../src/config/settings';
import { createTemplatePdf } from './helpers/pdf-fixtures';

describe('PDF API integration', () => {
  let app: ReturnType<typeof createApp>;
  let uploadsDir: string;
  let fontsDir: string;

  beforeAll(() => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'larc-pdf-api-'));
    uploadsDir = path.join(tempRoot, 'uploads');
    fontsDir = path.join(tempRoot, 'Fonts');

    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.mkdirSync(fontsDir, { recursive: true });

    const settings: AppSettings = {
      port: 0,
      maxFileSizeMB: 10,
      maxFileSizeBytes: 10 * 1024 * 1024,
      uploadsFolder: uploadsDir,
      uploadsDir,
      fontsFolder: fontsDir,
      fontsDir,
      defaultFontSize: 16,
      logLevel: 'silent'
    };

    app = createApp(settings);
  });

  afterAll(() => {
    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(path.dirname(uploadsDir), { recursive: true, force: true });
    }
  });

  it('POST /api/pdf/upload uploads a PDF', async () => {
    const pdf = await createTemplatePdf();

    const response = await request(app)
      .post('/api/pdf/upload')
      .attach('file', pdf, { filename: 'template.pdf', contentType: 'application/pdf' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.fileId).toBeTypeOf('string');
    expect(response.body.filePath).toBeTypeOf('string');
  });

  it('GET /api/pdf/metadata/:fileId returns metadata', async () => {
    const pdf = await createTemplatePdf();
    const upload = await request(app)
      .post('/api/pdf/upload')
      .attach('file', pdf, { filename: 'metadata.pdf', contentType: 'application/pdf' });

    const fileId = upload.body.fileId as string;
    const response = await request(app).get(`/api/pdf/metadata/${fileId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.pageCount).toBeGreaterThan(0);
    expect(response.body.fileSize).toBeGreaterThan(0);
  });

  it('DELETE /api/pdf/:fileId deletes existing file', async () => {
    const pdf = await createTemplatePdf();
    const upload = await request(app)
      .post('/api/pdf/upload')
      .attach('file', pdf, { filename: 'delete.pdf', contentType: 'application/pdf' });

    const fileId = upload.body.fileId as string;
    const response = await request(app).delete(`/api/pdf/${fileId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('deleted');
  });

  it('POST /api/pdf/preview-form returns generated merged PDF for multiple rows', async () => {
    const template = await createTemplatePdf();
    const csv = 'name,city,subscribed\nAlice,Bangkok,true\nBob,Chiang Mai,false\n';

    const response = await request(app)
      .post('/api/pdf/preview-form')
      .field('fontSize', '14')
      .attach('pdfFile', template, { filename: 'form.pdf', contentType: 'application/pdf' })
      .attach('data', Buffer.from(csv, 'utf8'), { filename: 'data.csv', contentType: 'text/csv' });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['x-rows-processed']).toBe('2');
    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.length).toBeGreaterThan(100);
  });
});
