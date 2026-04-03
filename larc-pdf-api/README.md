# LARC PDF API

Production-ready Node.js + TypeScript API for uploading PDFs, reading metadata, deleting uploaded files, and generating filled/merged PDFs from form data.

## Tech Stack

- Node.js 22+
- TypeScript (strict)
- Express
- Zod
- Multer 2
- pdf-lib + @pdf-lib/fontkit
- Pino + pino-http
- OpenAPI (swagger-jsdoc) + Scalar UI
- Vitest + Supertest
- ESLint + Prettier
- Docker / Docker Compose

## Project Structure

```text
src/
  app.ts
  server.ts
  config/
  controllers/
  middleware/
  models/
  services/
  types/
  utils/
tests/
uploads/
Fonts/
config/
```

## Environment Variables

Copy `.env.example` to `.env` and adjust values as needed.

- `NODE_ENV`: `development` | `production`
- `PORT`: API port (default `3000`)
- `MAX_FILE_SIZE_MB`: upload limit in MB
- `UPLOAD_DIR`: upload storage path
- `LOG_LEVEL`: pino log level (`info`, `debug`, etc.)
- `APPSETTINGS_PATH`: path to config JSON (default `config/appsettings.json`)

## Install and Run

```bash
npm install
npm run dev
```

Build and run:

```bash
npm run build
npm start
```

Run tests:

```bash
npm test
```

Lint and format:

```bash
npm run lint
npm run format
```

## API Docs

- OpenAPI JSON: `GET /openapi.json`
- Scalar UI: `GET /api-docs`

## Endpoints

- `POST /api/pdf/upload`
  - Multipart field: `file` (PDF)
  - Returns: `fileId`, `filePath`

- `GET /api/pdf/metadata/:fileId`
  - Returns basic PDF metadata and form field names

- `DELETE /api/pdf/:fileId`
  - Deletes uploaded file and map entry

- `POST /api/pdf/preview-form`
  - Multipart fields:
    - `template`: PDF template
    - `data`: CSV or JSON payload for form values
    - `fontSize` (optional)
  - Returns generated merged PDF buffer

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

## Notes

- Uploaded files are tracked in-memory by `fileId` to `filePath` map.
- The map resets when the process restarts.
- Place custom fonts in `Fonts/` for multilingual form rendering.
