import { copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

['index.html', '.nojekyll'].forEach(file => {
  copyFileSync(join(root, file), join(dist, file));
  console.log(`Copied ${file} → dist/${file}`);
});

// Promote nested app HTMLs to root-level named files
const apps = ['inviteflow', 'contactscout'];
for (const app of apps) {
  copyFileSync(join(dist, 'src', app, 'index.html'), join(dist, `${app}.html`));
  console.log(`Renamed dist/src/${app}/index.html → dist/${app}.html`);
}
