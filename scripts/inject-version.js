/**
 * inject-version.js
 *
 * Reads VITE_APP_VERSION from .env and propagates it to:
 *   - README.md  (product name, subtitle, and "InviteFlow vX" mentions)
 *   - src/inviteflow/pages/SyncPage.tsx  (GAS code comment header)
 *   - src/inviteflow/tabs/SyncTab.tsx    (GAS code comment header)
 *
 * Run after `vite build` (post-build step) so the .env is available.
 *
 * Usage: node scripts/inject-version.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Read version from .env (simple KEY=VALUE parser, no extra deps) ─────────
function parseEnvFile(content) {
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

const envPath = join(root, '.env');
let version;

if (process.env.VITE_APP_VERSION) {
  version = process.env.VITE_APP_VERSION;
} else {
  try {
    const parsed = parseEnvFile(readFileSync(envPath, 'utf8'));
    version = parsed.VITE_APP_VERSION;
  } catch {
    version = null;
  }
}

// Final fallback: read from package.json (release-please bumps this)
if (!version) {
  try {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    version = pkg.version;
  } catch {
    version = '0.0.0';
  }
}
console.log(`[inject-version] Injecting version: ${version}`);

// ── Helpers ───────────────────────────────────────────────────────────────────
function read(file) {
  return readFileSync(join(root, file), 'utf8');
}

function write(file, content) {
  writeFileSync(join(root, file), content, 'utf8');
  console.log(`[inject-version] Updated ${file}`);
}

// Extract the currently-baked version from a file (e.g. "v4.1.0") so we can
// do a full-string replace and avoid partial matches like "v4" in "v4.1.0".
function extractBakedVersion(content) {
  const m = content.match(/InviteFlow v(\d+\.\d+\.\d+)/);
  return m ? m[0] : null; // e.g. "InviteFlow v4.1.0"
}

function replaceVersionInFile(file, newVersion) {
  let content = read(file);
  const oldVersionStr = extractBakedVersion(content);
  if (!oldVersionStr) {
    console.warn(`[inject-version] No version pattern found in ${file}`);
    return;
  }
  if (oldVersionStr === `InviteFlow v${newVersion}`) {
    return; // already correct — idempotent
  }
  const updated = content.replaceAll(oldVersionStr, `InviteFlow v${newVersion}`);
  write(file, updated);
}

// ── README.md ────────────────────────────────────────────────────────────────
// README uses "InviteFlow vX.Y.Z" as the canonical product/version heading.
// We do a full-string replace so upgrading 4.1.0 → 4.2.0 won't accidentally
// create "4.2.0.1.0" (a bug that occurred with naive prefix-based matching).
replaceVersionInFile('README.md', version);

// ── GAS code comments (SyncTab / SyncPage) ───────────────────────────────────
// The GAS script header comment also bakes the version string.
replaceVersionInFile('src/inviteflow/pages/SyncPage.tsx', version);
replaceVersionInFile('src/inviteflow/tabs/SyncTab.tsx', version);

console.log('[inject-version] Done.');
