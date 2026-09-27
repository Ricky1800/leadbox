// @ts-check
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const entry = path.join(root, 'src', 'index.js');

async function main() {
  // IIFE build: auto-executes when loaded via a classic <script> tag, and
  // reads `document.currentScript` for data-* attribute auto-init.
  await build({
    entryPoints: [entry],
    outfile: path.join(root, 'dist', 'leadbox.min.js'),
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    platform: 'browser',
    legalComments: 'none',
    logLevel: 'info',
  });

  // ESM build: for bundler-based consumers (`import LeadBox from 'leadbox'`).
  // Not auto-initialized as aggressively since ESM consumers are expected to
  // call `LeadBox.init()` themselves, but the same auto-init guard still
  // applies if loaded via a module script tag with a currentScript.
  await build({
    entryPoints: [entry],
    outfile: path.join(root, 'dist', 'leadbox.esm.js'),
    bundle: true,
    minify: true,
    format: 'esm',
    target: ['es2020'],
    platform: 'browser',
    legalComments: 'none',
    logLevel: 'info',
  });

  console.log('Build complete: dist/leadbox.min.js, dist/leadbox.esm.js');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
