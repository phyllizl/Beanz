import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

const SIZE = 256;
const FRAMES = 12;
const DELAY = 80; // ms per frame

// Bounce curve — sine wave, peaks at frame 3, back to 0 at frame 6, etc.
function bounceY(frame) {
  return Math.sin((frame / FRAMES) * Math.PI * 2) * -18;
}

// Squash/stretch — squish at bottom of bounce, stretch at top
function scaleY(frame) {
  const t = Math.sin((frame / FRAMES) * Math.PI * 2);
  return 1 + t * 0.08; // stretch up to 8% taller at peak
}
function scaleX(frame) {
  const t = Math.sin((frame / FRAMES) * Math.PI * 2);
  return 1 - t * 0.05; // squish 5% wider at bottom
}

function makeGreenBeanSvg(yOff, sy, sx) {
  const cx = 128, cy = 130;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="gb" cx="0.5" cy="0.4" r="0.55">
      <stop offset="0%" stop-color="#88FF44"/>
      <stop offset="40%" stop-color="#44EE11"/>
      <stop offset="100%" stop-color="#22AA00"/>
    </radialGradient>
  </defs>
  <g transform="translate(${cx}, ${cy + yOff}) scale(${sx}, ${sy}) translate(${-cx}, ${-cy})">
  <!-- Bean body -->
  <path d="
    M 130 24
    C 165 20, 192 48, 190 82
    C 188 110, 178 125, 172 138
    C 164 155, 162 158, 168 178
    C 176 202, 182 222, 162 238
    C 142 254, 112 248, 96 230
    C 80 212, 78 192, 82 172
    C 86 152, 96 142, 98 128
    C 100 112, 90 88, 82 68
    C 72 42, 95 20, 118 22
    C 122 22, 126 22, 130 24 Z
  " fill="url(#gb)" stroke="#1A7A0A" stroke-width="5"/>
  <!-- Highlight -->
  <path d="
    M 158 52
    C 164 78, 148 118, 138 145
    C 130 168, 142 200, 148 225
  " stroke="rgba(200,255,150,0.5)" stroke-width="16" fill="none" stroke-linecap="round"/>
  <!-- Left eye -->
  <circle cx="112" cy="78" r="11" fill="white" stroke="#1A5A0A" stroke-width="3"/>
  <circle cx="114" cy="76" r="5.5" fill="#333"/>
  <circle cx="116" cy="74" r="2" fill="white"/>
  <!-- Right eye -->
  <circle cx="155" cy="72" r="15" fill="white" stroke="#1A5A0A" stroke-width="3"/>
  <circle cx="157" cy="70" r="7" fill="#333"/>
  <circle cx="160" cy="67" r="2.5" fill="white"/>
  <!-- Smile -->
  <path d="M 120 168 C 128 180, 148 180, 155 168" stroke="#1A5A0A" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Left arm -->
  <line x1="88" y1="98" x2="48" y2="68" stroke="#5A3A1A" stroke-width="5" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="38" y2="62" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="40" y2="72" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="42" y2="58" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <!-- Right arm -->
  <line x1="186" y1="88" x2="218" y2="58" stroke="#5A3A1A" stroke-width="5" stroke-linecap="round"/>
  <line x1="218" y1="58" x2="228" y2="52" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="218" y1="58" x2="226" y2="62" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="218" y1="58" x2="224" y2="48" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <!-- Left leg + shoe -->
  <line x1="105" y1="238" x2="88" y2="246" stroke="#5A3A1A" stroke-width="4.5" stroke-linecap="round"/>
  <ellipse cx="78" cy="248" rx="15" ry="6" fill="#5A3A1A"/>
  <!-- Right leg + shoe -->
  <line x1="152" y1="242" x2="168" y2="248" stroke="#5A3A1A" stroke-width="4.5" stroke-linecap="round"/>
  <ellipse cx="178" cy="250" rx="15" ry="6" fill="#5A3A1A"/>
  </g>
</svg>`;
}

function makeRedBeanSvg(yOff, sy, sx) {
  const cx = 128, cy = 130;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="rb" cx="0.5" cy="0.4" r="0.55">
      <stop offset="0%" stop-color="#FF7744"/>
      <stop offset="40%" stop-color="#EE3311"/>
      <stop offset="100%" stop-color="#BB1100"/>
    </radialGradient>
  </defs>
  <g transform="translate(${cx}, ${cy + yOff}) scale(${sx}, ${sy}) translate(${-cx}, ${-cy})">
  <!-- Bean body -->
  <path d="
    M 130 24
    C 165 20, 192 48, 190 82
    C 188 110, 178 125, 172 138
    C 164 155, 162 158, 168 178
    C 176 202, 182 222, 162 238
    C 142 254, 112 248, 96 230
    C 80 212, 78 192, 82 172
    C 86 152, 96 142, 98 128
    C 100 112, 90 88, 82 68
    C 72 42, 95 20, 118 22
    C 122 22, 126 22, 130 24 Z
  " fill="url(#rb)" stroke="#7A1005" stroke-width="5"/>
  <!-- Highlight -->
  <path d="
    M 158 52
    C 164 78, 148 118, 138 145
    C 130 168, 142 200, 148 225
  " stroke="rgba(255,180,100,0.45)" stroke-width="16" fill="none" stroke-linecap="round"/>
  <!-- Left eye -->
  <circle cx="112" cy="78" r="11" fill="white" stroke="#5A0A05" stroke-width="3"/>
  <circle cx="114" cy="76" r="5.5" fill="#333"/>
  <circle cx="116" cy="74" r="2" fill="white"/>
  <!-- Right eye -->
  <circle cx="155" cy="72" r="15" fill="white" stroke="#5A0A05" stroke-width="3"/>
  <circle cx="157" cy="70" r="7" fill="#333"/>
  <circle cx="160" cy="67" r="2.5" fill="white"/>
  <!-- Smile -->
  <path d="M 120 168 C 128 180, 148 180, 155 168" stroke="#5A0A05" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Left arm -->
  <line x1="88" y1="98" x2="48" y2="68" stroke="#5A3A1A" stroke-width="5" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="38" y2="62" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="40" y2="72" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="42" y2="58" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <!-- Right arm -->
  <line x1="186" y1="88" x2="218" y2="58" stroke="#5A3A1A" stroke-width="5" stroke-linecap="round"/>
  <line x1="218" y1="58" x2="228" y2="52" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="218" y1="58" x2="226" y2="62" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="218" y1="58" x2="224" y2="48" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <!-- Left leg + shoe -->
  <line x1="105" y1="238" x2="88" y2="246" stroke="#5A3A1A" stroke-width="4.5" stroke-linecap="round"/>
  <ellipse cx="78" cy="248" rx="15" ry="6" fill="#5A3A1A"/>
  <!-- Right leg + shoe -->
  <line x1="152" y1="242" x2="168" y2="248" stroke="#5A3A1A" stroke-width="4.5" stroke-linecap="round"/>
  <ellipse cx="178" cy="250" rx="15" ry="6" fill="#5A3A1A"/>
  </g>
</svg>`;
}

async function makeGif(svgFn, filename) {
  const frames = [];

  for (let i = 0; i < FRAMES; i++) {
    const yOff = bounceY(i);
    const sy = scaleY(i);
    const sx = scaleX(i);
    const svg = svgFn(yOff, sy, sx);
    const png = await sharp(Buffer.from(svg))
      .resize(SIZE, SIZE)
      .ensureAlpha()
      .raw()
      .toBuffer();
    frames.push(png);
  }

  // Join frames into animated GIF via sharp
  // Create each frame as a sharp image, then join vertically and output as animated GIF
  const framePngs = [];
  for (let i = 0; i < FRAMES; i++) {
    const yOff = bounceY(i);
    const sy = scaleY(i);
    const sx = scaleX(i);
    const svg = svgFn(yOff, sy, sx);
    const png = await sharp(Buffer.from(svg))
      .resize(SIZE, SIZE)
      .png()
      .toBuffer();
    framePngs.push(png);
  }

  // Stack frames vertically into one tall image, then output as animated GIF
  const stacked = await sharp(framePngs[0])
    .joinChannel([]) // just to get the pipeline going
    .toBuffer();

  // Sharp animated GIF: stack frames vertically, then use animation options
  const tallImage = await sharp({
    create: {
      width: SIZE,
      height: SIZE * FRAMES,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(framePngs.map((png, i) => ({
      input: png,
      top: i * SIZE,
      left: 0,
    })))
    .png()
    .toBuffer();

  await sharp(tallImage, { pages: FRAMES })
    .gif({ delay: Array(FRAMES).fill(DELAY), loop: 0 })
    .toFile(join(assetsDir, filename));

  console.log(`✓ ${filename} (${FRAMES} frames, ${DELAY}ms delay)`);
}

async function main() {
  console.log('Generating bouncing GIFs...\n');
  await makeGif(makeGreenBeanSvg, 'greenbean.gif');
  await makeGif(makeRedBeanSvg, 'redbean.gif');
  console.log('\nDone!');
}

main().catch(console.error);
