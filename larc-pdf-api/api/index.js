const path = require('node:path');

const { createApp } = require('../dist/app.js');
const { loadSettings } = require('../dist/config/settings.js');

const rootDir = process.cwd();

// Vercel functions can only write to /tmp.
process.env.PDF_UPLOADS_FOLDER = process.env.PDF_UPLOADS_FOLDER || '/tmp/uploads';
process.env.PDF_FONTS_FOLDER = process.env.PDF_FONTS_FOLDER || path.resolve(rootDir, 'Fonts');

const app = createApp(loadSettings(rootDir));

module.exports = app;
