import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

const SIZE = 256;

// ============================================================
// 1. GREEN BEAN — kidney bean with S-curve pinch, tilted right
//    Wide rounded top curving right, concave left waist,
//    wide bottom bulge curving left. Twig arms, oval shoes.
// ============================================================
const greenBeanSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="gb" cx="0.5" cy="0.4" r="0.55">
      <stop offset="0%" stop-color="#88FF44"/>
      <stop offset="40%" stop-color="#44EE11"/>
      <stop offset="100%" stop-color="#22AA00"/>
    </radialGradient>
  </defs>
  <!-- Bean body — true kidney shape with S-curve, tilted right -->
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
  <!-- Center highlight streak following the S -->
  <path d="
    M 158 52
    C 164 78, 148 118, 138 145
    C 130 168, 142 200, 148 225
  " stroke="rgba(200,255,150,0.5)" stroke-width="16" fill="none" stroke-linecap="round"/>
  <!-- Left eye (smaller) -->
  <circle cx="112" cy="78" r="11" fill="white" stroke="#1A5A0A" stroke-width="3"/>
  <circle cx="114" cy="76" r="5.5" fill="#333"/>
  <circle cx="116" cy="74" r="2" fill="white"/>
  <!-- Right eye (bigger) -->
  <circle cx="155" cy="72" r="15" fill="white" stroke="#1A5A0A" stroke-width="3"/>
  <circle cx="157" cy="70" r="7" fill="#333"/>
  <circle cx="160" cy="67" r="2.5" fill="white"/>
  <!-- Small curved smile low on the body -->
  <path d="M 120 168 C 128 180, 148 180, 155 168" stroke="#1A5A0A" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Left arm — thin twig with finger branches -->
  <line x1="88" y1="98" x2="48" y2="68" stroke="#5A3A1A" stroke-width="5" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="38" y2="62" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="40" y2="72" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="42" y2="58" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <!-- Right arm — thin twig with finger branches -->
  <line x1="186" y1="88" x2="218" y2="58" stroke="#5A3A1A" stroke-width="5" stroke-linecap="round"/>
  <line x1="218" y1="58" x2="228" y2="52" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="218" y1="58" x2="226" y2="62" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="218" y1="58" x2="224" y2="48" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <!-- Left leg + shoe — splayed out left -->
  <line x1="105" y1="238" x2="88" y2="246" stroke="#5A3A1A" stroke-width="4.5" stroke-linecap="round"/>
  <ellipse cx="78" cy="248" rx="15" ry="6" fill="#5A3A1A"/>
  <!-- Right leg + shoe — splayed out right -->
  <line x1="152" y1="242" x2="168" y2="248" stroke="#5A3A1A" stroke-width="4.5" stroke-linecap="round"/>
  <ellipse cx="178" cy="250" rx="15" ry="6" fill="#5A3A1A"/>
</svg>`;

// ============================================================
// 2. RED BEAN — same kidney shape as green, red/orange
// ============================================================
const redBeanSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="rb" cx="0.5" cy="0.4" r="0.55">
      <stop offset="0%" stop-color="#FF7744"/>
      <stop offset="40%" stop-color="#EE3311"/>
      <stop offset="100%" stop-color="#BB1100"/>
    </radialGradient>
  </defs>
  <!-- Bean body — same kidney S-curve as green bean -->
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
  <!-- Center highlight streak -->
  <path d="
    M 158 52
    C 164 78, 148 118, 138 145
    C 130 168, 142 200, 148 225
  " stroke="rgba(255,180,100,0.45)" stroke-width="16" fill="none" stroke-linecap="round"/>
  <!-- Left eye (smaller) -->
  <circle cx="112" cy="78" r="11" fill="white" stroke="#5A0A05" stroke-width="3"/>
  <circle cx="114" cy="76" r="5.5" fill="#333"/>
  <circle cx="116" cy="74" r="2" fill="white"/>
  <!-- Right eye (bigger) -->
  <circle cx="155" cy="72" r="15" fill="white" stroke="#5A0A05" stroke-width="3"/>
  <circle cx="157" cy="70" r="7" fill="#333"/>
  <circle cx="160" cy="67" r="2.5" fill="white"/>
  <!-- Small curved smile -->
  <path d="M 120 168 C 128 180, 148 180, 155 168" stroke="#5A0A05" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Left arm — thin twig with finger branches -->
  <line x1="88" y1="98" x2="48" y2="68" stroke="#5A3A1A" stroke-width="5" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="38" y2="62" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="40" y2="72" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="68" x2="42" y2="58" stroke="#5A3A1A" stroke-width="4" stroke-linecap="round"/>
  <!-- Right arm — thin twig with finger branches -->
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
</svg>`;

// ============================================================
// 3. MAGIC BEAN — crescent/cashew shapes, cream with orange dots
// ============================================================
const magicBeanSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="mb" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#FFEEBB"/>
      <stop offset="50%" stop-color="#EEDD99"/>
      <stop offset="100%" stop-color="#DDCC77"/>
    </linearGradient>
  </defs>
  <!-- Bean 1 (top right) — crescent/cashew shape -->
  <path d="
    M 155 40 C 185 35, 210 55, 205 80
    C 200 105, 170 110, 150 100
    C 140 95, 138 72, 145 55
    C 148 45, 152 42, 155 40 Z
  " fill="url(#mb)" stroke="#AA8844" stroke-width="4"/>
  <!-- Dots on bean 1 -->
  <circle cx="170" cy="60" r="6" fill="#EE6622" opacity="0.8"/>
  <circle cx="185" cy="78" r="5.5" fill="#EE6622" opacity="0.8"/>
  <circle cx="165" cy="88" r="5" fill="#EE6622" opacity="0.8"/>
  <circle cx="155" cy="68" r="4" fill="#EE6622" opacity="0.6"/>
  <!-- Highlight on bean 1 -->
  <ellipse cx="170" cy="55" rx="10" ry="6" fill="rgba(255,255,255,0.4)" transform="rotate(-20 170 55)"/>

  <!-- Bean 2 (bottom left) — crescent -->
  <path d="
    M 50 140 C 30 145, 15 175, 28 200
    C 40 220, 70 225, 90 210
    C 100 202, 98 178, 85 162
    C 75 148, 60 138, 50 140 Z
  " fill="url(#mb)" stroke="#AA8844" stroke-width="4"/>
  <!-- Dots on bean 2 -->
  <circle cx="48" cy="175" r="6" fill="#EE6622" opacity="0.8"/>
  <circle cx="65" cy="195" r="5.5" fill="#EE6622" opacity="0.8"/>
  <circle cx="38" cy="198" r="4.5" fill="#EE6622" opacity="0.8"/>
  <circle cx="72" cy="172" r="4" fill="#EE6622" opacity="0.6"/>
  <!-- Highlight on bean 2 -->
  <ellipse cx="45" cy="165" rx="9" ry="5" fill="rgba(255,255,255,0.4)" transform="rotate(15 45 165)"/>

  <!-- Bean 3 (bottom right) — crescent -->
  <path d="
    M 175 150 C 205 142, 235 158, 232 185
    C 230 210, 205 222, 185 215
    C 172 210, 162 190, 165 172
    C 167 158, 172 152, 175 150 Z
  " fill="url(#mb)" stroke="#AA8844" stroke-width="4"/>
  <!-- Dots on bean 3 -->
  <circle cx="205" cy="168" r="6" fill="#EE6622" opacity="0.8"/>
  <circle cx="215" cy="192" r="5" fill="#EE6622" opacity="0.8"/>
  <circle cx="192" cy="200" r="5" fill="#EE6622" opacity="0.8"/>
  <circle cx="195" cy="172" r="3.5" fill="#EE6622" opacity="0.6"/>
  <!-- Highlight on bean 3 -->
  <ellipse cx="200" cy="158" rx="9" ry="5" fill="rgba(255,255,255,0.4)" transform="rotate(-10 200 158)"/>
</svg>`;

// ============================================================
// 4. SPROUT — sprout from soil mound, matching original style
// ============================================================
const sproutSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="so" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8B6914"/>
      <stop offset="100%" stop-color="#5C3D0A"/>
    </linearGradient>
    <linearGradient id="lf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#66DD33"/>
      <stop offset="100%" stop-color="#2E8B22"/>
    </linearGradient>
    <linearGradient id="st" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#55BB22"/>
      <stop offset="100%" stop-color="#88DD44"/>
    </linearGradient>
  </defs>
  <!-- Soil mound -->
  <ellipse cx="128" cy="200" rx="100" ry="35" fill="url(#so)" stroke="#3D2806" stroke-width="5"/>
  <!-- Soil texture -->
  <ellipse cx="128" cy="195" rx="88" ry="26" fill="#7A5C10" opacity="0.3"/>
  <circle cx="85" cy="200" r="3.5" fill="#3D2806" opacity="0.35"/>
  <circle cx="152" cy="205" r="3" fill="#3D2806" opacity="0.35"/>
  <circle cx="170" cy="196" r="2.5" fill="#3D2806" opacity="0.35"/>
  <circle cx="110" cy="210" r="2.5" fill="#3D2806" opacity="0.35"/>
  <!-- Stem — tapers upward -->
  <path d="M 124 190 C 122 160, 128 130, 128 95" stroke="#55BB22" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M 126 188 C 124 158, 130 128, 130 97" stroke="#88DD44" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Left leaf — curved teardrop -->
  <path d="M 128 118 C 108 96, 58 88, 52 105 C 48 118, 72 132, 128 118" fill="url(#lf)" stroke="#1A6A0A" stroke-width="4"/>
  <!-- Left leaf vein -->
  <path d="M 126 118 C 100 110, 68 106, 58 110" stroke="#1A6A0A" stroke-width="1.5" fill="none" opacity="0.45"/>
  <!-- Left leaf highlight -->
  <ellipse cx="82" cy="102" rx="14" ry="5" transform="rotate(-12 82 102)" fill="rgba(255,255,255,0.3)"/>
  <!-- Right leaf — curved teardrop -->
  <path d="M 130 98 C 152 72, 202 64, 208 82 C 212 96, 186 112, 130 98" fill="url(#lf)" stroke="#1A6A0A" stroke-width="4"/>
  <!-- Right leaf vein -->
  <path d="M 132 98 C 160 88, 192 84, 202 88" stroke="#1A6A0A" stroke-width="1.5" fill="none" opacity="0.45"/>
  <!-- Right leaf highlight -->
  <ellipse cx="178" cy="78" rx="14" ry="5" transform="rotate(12 178 78)" fill="rgba(255,255,255,0.3)"/>
</svg>`;

// ============================================================
// 5. STAR — chunky golden star with thick outline
// ============================================================
const starSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="sg" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#FFEE55"/>
      <stop offset="40%" stop-color="#FFCC00"/>
      <stop offset="100%" stop-color="#DDAA00"/>
    </linearGradient>
  </defs>
  <!-- Star -->
  <polygon points="128,20 154,96 236,96 170,142 194,222 128,176 62,222 86,142 20,96 102,96"
    fill="url(#sg)" stroke="#AA7700" stroke-width="6" stroke-linejoin="round"/>
  <!-- Inner highlight facet -->
  <polygon points="128,52 148,104 196,104 158,134 172,188 128,162 84,188 98,134 60,104 108,104"
    fill="rgba(255,255,255,0.28)"/>
  <!-- Top-left shine -->
  <ellipse cx="104" cy="92" rx="16" ry="10" transform="rotate(-20 104 92)" fill="rgba(255,255,255,0.3)"/>
</svg>`;

// ============================================================
// 6. MONSTER — round red blob, horns, angry brow, wide frown,
//    stubby arms with curled claws, small feet
// ============================================================
const monsterSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="mo" cx="0.45" cy="0.4" r="0.55">
      <stop offset="0%" stop-color="#EE4444"/>
      <stop offset="60%" stop-color="#CC2222"/>
      <stop offset="100%" stop-color="#881010"/>
    </radialGradient>
  </defs>
  <!-- Horns -->
  <path d="M 80 78 L 68 32 L 92 68" fill="#CC2222" stroke="#5A0A0A" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 176 78 L 188 32 L 164 68" fill="#CC2222" stroke="#5A0A0A" stroke-width="4" stroke-linejoin="round"/>
  <!-- Horn tips — yellow/gold balls -->
  <circle cx="68" cy="32" r="8" fill="#FFCC22" stroke="#AA8800" stroke-width="3"/>
  <circle cx="188" cy="32" r="8" fill="#FFCC22" stroke="#AA8800" stroke-width="3"/>
  <!-- Body — big round blob -->
  <ellipse cx="128" cy="148" rx="82" ry="78" fill="url(#mo)" stroke="#5A0A0A" stroke-width="5"/>
  <!-- Angry V-eyebrows -->
  <line x1="82" y1="105" x2="110" y2="118" stroke="#5A0A0A" stroke-width="6" stroke-linecap="round"/>
  <line x1="174" y1="105" x2="146" y2="118" stroke="#5A0A0A" stroke-width="6" stroke-linecap="round"/>
  <!-- Left eye -->
  <circle cx="104" cy="132" r="14" fill="white" stroke="#5A0A0A" stroke-width="3"/>
  <circle cx="106" cy="134" r="7" fill="#333"/>
  <circle cx="108" cy="131" r="2.5" fill="white"/>
  <!-- Right eye -->
  <circle cx="152" cy="132" r="14" fill="white" stroke="#5A0A0A" stroke-width="3"/>
  <circle cx="150" cy="134" r="7" fill="#333"/>
  <circle cx="148" cy="131" r="2.5" fill="white"/>
  <!-- Wide downturned frown -->
  <path d="M 90 172 C 100 160, 156 160, 166 172" stroke="#5A0A0A" stroke-width="6" fill="none" stroke-linecap="round"/>
  <!-- Stubby arms with curled claws -->
  <path d="M 50 138 C 35 132, 28 140, 30 148 C 32 154, 38 152, 36 146" stroke="#AA8822" stroke-width="5.5" fill="none" stroke-linecap="round"/>
  <line x1="50" y1="140" x2="36" y2="136" stroke="#5A0A0A" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M 206 138 C 221 132, 228 140, 226 148 C 224 154, 218 152, 220 146" stroke="#AA8822" stroke-width="5.5" fill="none" stroke-linecap="round"/>
  <line x1="206" y1="140" x2="220" y2="136" stroke="#5A0A0A" stroke-width="5.5" stroke-linecap="round"/>
  <!-- Small feet -->
  <ellipse cx="104" cy="226" rx="14" ry="8" fill="#AA1515" stroke="#5A0A0A" stroke-width="4"/>
  <ellipse cx="152" cy="226" rx="14" ry="8" fill="#AA1515" stroke="#5A0A0A" stroke-width="4"/>
</svg>`;

async function generatePng(svg, filename, size = SIZE) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(assetsDir, filename));
  console.log(`✓ ${filename} (${size}x${size})`);
}

async function generateIcons() {
  const beanSvg = Buffer.from(greenBeanSvg);

  const fg = await sharp(beanSvg)
    .resize(352, 352, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 80, bottom: 80, left: 80, right: 80, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  await sharp(fg).toFile(join(assetsDir, 'android-icon-foreground.png'));
  console.log('✓ android-icon-foreground.png (512x512)');

  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#1A1A2E' } })
    .png().toFile(join(assetsDir, 'android-icon-background.png'));
  console.log('✓ android-icon-background.png (512x512)');

  const monoRaw = await sharp(beanSvg)
    .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const silData = Buffer.alloc(monoRaw.info.width * monoRaw.info.height * 4);
  for (let i = 0; i < monoRaw.info.width * monoRaw.info.height; i++) {
    const a = monoRaw.data[i * 4 + 3];
    silData[i * 4] = silData[i * 4 + 1] = silData[i * 4 + 2] = 255;
    silData[i * 4 + 3] = a > 30 ? 255 : 0;
  }
  const sil = await sharp(silData, { raw: { width: monoRaw.info.width, height: monoRaw.info.height, channels: 4 } })
    .png().toBuffer();
  await sharp({ create: { width: 432, height: 432, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: sil, gravity: 'centre' }])
    .png().toFile(join(assetsDir, 'android-icon-monochrome.png'));
  console.log('✓ android-icon-monochrome.png (432x432)');

  const iconBean = await sharp(beanSvg)
    .resize(664, 664, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  const full = await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#1A1A2E' } })
    .composite([{ input: iconBean, gravity: 'centre' }])
    .png().toBuffer();
  await sharp(full).toFile(join(assetsDir, 'icon.png'));
  console.log('✓ icon.png (1024x1024)');
  await sharp(full).toFile(join(assetsDir, 'splash-icon.png'));
  console.log('✓ splash-icon.png (1024x1024)');
  await sharp(full).resize(48, 48).toFile(join(assetsDir, 'favicon.png'));
  console.log('✓ favicon.png (48x48)');
}

async function main() {
  console.log('Generating game assets...\n');
  await generatePng(greenBeanSvg, 'greenbean.png');
  await generatePng(redBeanSvg, 'redbean.png');
  await generatePng(magicBeanSvg, 'magicbean.png');
  await generatePng(sproutSvg, 'sprout.png');
  await generatePng(starSvg, 'star.png');
  await generatePng(monsterSvg, 'monster.png');
  console.log('\nGenerating app icons...\n');
  await generateIcons();
  console.log('\nDone!');
}

main().catch(console.error);
