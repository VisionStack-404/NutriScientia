import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const androidAssetsDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets');

if (!fs.existsSync(distDir)) {
  console.error('dist/ folder not found. Run "npm run build" first.');
  process.exit(1);
}

fs.rmSync(androidAssetsDir, { recursive: true, force: true });
fs.mkdirSync(androidAssetsDir, { recursive: true });
fs.cpSync(distDir, androidAssetsDir, { recursive: true });

console.log(`Synced production Nutrisicentia bundle from dist/ -> ${path.relative(rootDir, androidAssetsDir)}`);
