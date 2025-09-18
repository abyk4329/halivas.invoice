/*
 Generates high-quality glassmorphism icons for iOS/Android while preserving the exact provided SVG (HBiconfavicon.svg) as the brand glyph.
 - Reads public/HBiconfavicon.svg as the foreground glyph
 - Renders a glass background (rounded, blur, gradient, highlights)
 - Composites and exports multiple sizes: 180, 192, 256, 384, 512 (PNG)
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd());
const PUBLIC = path.join(ROOT, 'public');

const sizes = [120, 152, 167, 180, 192, 256, 384, 512];

// Simple glass background SVG generator
function glassBgSVG(size: number) {
  const radius = Math.round(size * 0.22);
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.70"/>
        <stop offset="100%" stop-color="#e9eef3" stop-opacity="0.40"/>
      </linearGradient>
      <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feOffset dx="0" dy="1"/>
        <feGaussianBlur stdDeviation="2" result="offset-blur"/>
        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
        <feFlood flood-color="#000" flood-opacity="0.12" result="color"/>
        <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
        <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
      </filter>
    </defs>
    <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#g1)" filter="url(#innerShadow)"/>
    <rect x="${Math.round(size*0.1)}" y="${Math.round(size*0.08)}" width="${Math.round(size*0.6)}" height="${Math.round(size*0.25)}" rx="${Math.round(size*0.12)}" fill="#ffffff" opacity="0.25"/>
  </svg>`;
}

async function main() {
  const glyphSvgPath = path.join(PUBLIC, 'HBiconfavicon.svg');
  const glyphSvg = await fs.readFile(glyphSvgPath);

  for (const size of sizes) {
    const bgSvg = Buffer.from(glassBgSVG(size));

    // Render background to PNG
    const bgPng = await sharp(bgSvg).png().toBuffer();

    // Render glyph to transparent PNG, scaled to fit ~60% of canvas
    const glyphMax = Math.round(size * 0.6);
    const glyphPng = await sharp(glyphSvg).resize({ width: glyphMax, height: glyphMax, fit: 'inside' }).png().toBuffer();

    // Composite centered
    const composed = await sharp(bgPng)
      .composite([
        {
          input: glyphPng,
          top: Math.round((size - glyphMax) / 2),
          left: Math.round((size - glyphMax) / 2),
        },
      ])
      .png()
      .toBuffer();

  let outName: string;
  if (size === 180) outName = 'apple-touch-icon.png';
  else if (size === 120) outName = 'apple-touch-icon-120x120.png';
  else if (size === 152) outName = 'apple-touch-icon-152x152.png';
  else if (size === 167) outName = 'apple-touch-icon-167x167.png';
  else outName = `icon-${size}.png`;
    await sharp(composed)
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(path.join(PUBLIC, outName));
  }

  // Also export a 512 maskable
  await sharp(path.join(PUBLIC, 'icon-512.png'))
    .png()
    .toFile(path.join(PUBLIC, 'icon-512-maskable.png'));

  console.log('Icons generated:', sizes);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
