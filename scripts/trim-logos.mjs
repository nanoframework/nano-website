#!/usr/bin/env node
/**
 * Trim the empty margin around company logos so they fill their tiles.
 *
 *   node scripts/trim-logos.mjs              # every image in src/assets/partners/
 *   node scripts/trim-logos.mjs <file> ...   # specific files
 *
 * Removes borders that match the top-left pixel (white or transparent padding), then adds back
 * a thin, even margin. Overwrites the files in place; SVGs are skipped.
 */
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dir = 'src/assets/partners';
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : (await readdir(dir)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).map((f) => path.join(dir, f));

for (const file of files) {
  const before = await sharp(file).metadata();
  const { data, info } = await sharp(file).trim({ threshold: 12 }).toBuffer({ resolveWithObject: true });
  if (info.width === before.width && info.height === before.height) {
    console.log(`  ${file}: nothing to trim (${before.width}×${before.height})`);
    continue;
  }
  const pad = Math.round(Math.max(info.width, info.height) * 0.02);
  const hasAlpha = before.hasAlpha;
  const out = await sharp(data)
    .extend({
      top: pad, bottom: pad, left: pad, right: pad,
      background: hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFormat(before.format)
    .toBuffer();
  await writeFile(file, out);
  console.log(`✓ ${file}: ${before.width}×${before.height} → ${info.width + 2 * pad}×${info.height + 2 * pad}`);
}
