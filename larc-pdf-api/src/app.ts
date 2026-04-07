import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { apiReference } from '@scalar/express-api-reference';
import type { AppSettings } from './config/settings';
import { createPdfRouter } from './controllers/pdf.controller';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { generateOpenApiSpec } from './utils/openapi';

export const createApp = (settings: AppSettings) => {
  const app = express();
  const logger = pino({ level: settings.logLevel });

  app.use(pinoHttp({ logger }));
  app.use(cors());
  app.use(express.json({ limit: settings.maxFileSizeBytes }));

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'OK' });
  });

  const openApiSpec = generateOpenApiSpec();
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use(
    '/scalar',
    apiReference({
      spec: { content: openApiSpec },
      theme: 'default'
    })
  );

  app.use('/api/pdf', createPdfRouter(settings));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
