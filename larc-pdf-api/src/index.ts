import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app';
import { loadSettings } from './config/settings';

const rootDir = path.resolve(__dirname, '..');
const settings = loadSettings(rootDir);

fs.mkdirSync(settings.uploadsDir, { recursive: true });
fs.mkdirSync(settings.fontsDir, { recursive: true });

const app = createApp(settings);

app.listen(settings.port, () => {
  // eslint-disable-next-line no-console
  console.log(`LARC PDF API running on port ${settings.port}`);
});
