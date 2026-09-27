// @ts-check
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'dist', 'leadbox.min.js');

// Size budget from the project spec: min+gzip must stay under 10 KB.
const BUDGET_BYTES = 10 * 1024;

function main() {
  /** @type {Buffer} */
  let source;
  try {
    source = readFileSync(target);
  } catch {
    console.error(`Could not read ${target}. Run "npm run build" first.`);
    process.exit(1);
    return;
  }

  const gzipped = gzipSync(source, { level: 9 });
  const rawKb = (source.length / 1024).toFixed(2);
  const gzipKb = (gzipped.length / 1024).toFixed(2);
  const budgetKb = (BUDGET_BYTES / 1024).toFixed(0);

  console.log(`dist/leadbox.min.js: ${rawKb} KB raw, ${gzipKb} KB gzipped (budget: ${budgetKb} KB gzipped)`);

  if (gzipped.length > BUDGET_BYTES) {
    console.error(
      `Size budget exceeded: ${gzipKb} KB gzipped > ${budgetKb} KB budget. Trim the bundle or raise the budget deliberately.`
    );
    process.exit(1);
  }
}

main();
