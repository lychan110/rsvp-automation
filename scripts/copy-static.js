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

// Rename the nested inviteflow HTML to root-level inviteflow.html
copyFileSync(
  join(dist, 'src', 'inviteflow', 'index.html'),
  join(dist, 'inviteflow.html')
);
console.log('Renamed dist/src/inviteflow/index.html → dist/inviteflow.html');
