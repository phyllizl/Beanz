import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');
const greenBeanGif = join(assetsDir, 'greenbean.gif');

const DARK_BG = '#1A1A2E';

async function generate() {
  // Extract first frame from the GIF
  const frame = sharp(greenBeanGif, { page: 0 });
  const meta = await frame.metadata();
  console.log(`Source GIF: ${meta.width}x${meta.height}`);

  // Create a trimmed version of the bean (remove whitespace around it)
  const trimmed = await frame.trim().png().toBuffer();
  const trimMeta = await sharp(trimmed).metadata();
  console.log(`Trimmed: ${trimMeta.width}x${trimMeta.height}`);

  // --- Foreground (512x512, transparent, bean centered with padding) ---
  const fgPadding = 80;
  const fgSize = 512;
  const fgInner = fgSize - fgPadding * 2;
  const resizedBean = await sharp(trimmed)
    .resize(fgInner, fgInner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: fgSize, height: fgSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([{ input: resizedBean, gravity: 'centre' }])
    .png()
    .toFile(join(assetsDir, 'android-icon-foreground.png'));
  console.log('✓ android-icon-foreground.png (512x512)');

  // --- Background (512x512, solid dark) ---
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: DARK_BG }
  })
    .png()
    .toFile(join(assetsDir, 'android-icon-background.png'));
  console.log('✓ android-icon-background.png (512x512)');

  // --- Monochrome (432x432, white silhouette on transparent) ---
  const monoSize = 432;
  const monoPadding = 66;
  const monoInner = monoSize - monoPadding * 2;
  const monoBean = await sharp(trimmed)
    .resize(monoInner, monoInner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .png()
    .toBuffer();

  // Extract alpha channel and use it as white silhouette
  const { data: monoData, info: monoInfo } = await sharp(monoBean)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const silhouetteData = Buffer.alloc(monoInfo.width * monoInfo.height * 4);
  for (let i = 0; i < monoInfo.width * monoInfo.height; i++) {
    const alpha = monoData[i * 4 + 3];
    silhouetteData[i * 4 + 0] = 255; // R
    silhouetteData[i * 4 + 1] = 255; // G
    silhouetteData[i * 4 + 2] = 255; // B
    silhouetteData[i * 4 + 3] = alpha > 30 ? 255 : 0;
  }

  const silhouette = await sharp(silhouetteData, {
    raw: { width: monoInfo.width, height: monoInfo.height, channels: 4 }
  }).png().toBuffer();

  await sharp({
    create: { width: monoSize, height: monoSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([{ input: silhouette, gravity: 'centre' }])
    .png()
    .toFile(join(assetsDir, 'android-icon-monochrome.png'));
  console.log('✓ android-icon-monochrome.png (432x432)');

  // --- Full icon (1024x1024, bean on dark background) ---
  const iconSize = 1024;
  const iconPadding = 180;
  const iconInner = iconSize - iconPadding * 2;
  const iconBean = await sharp(trimmed)
    .resize(iconInner, iconInner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: iconSize, height: iconSize, channels: 4, background: DARK_BG }
  })
    .composite([{ input: iconBean, gravity: 'centre' }])
    .png()
    .toFile(join(assetsDir, 'icon.png'));
  console.log('✓ icon.png (1024x1024)');

  // --- Splash icon (1024x1024, same as icon) ---
  await sharp({
    create: { width: iconSize, height: iconSize, channels: 4, background: DARK_BG }
  })
    .composite([{ input: iconBean, gravity: 'centre' }])
    .png()
    .toFile(join(assetsDir, 'splash-icon.png'));
  console.log('✓ splash-icon.png (1024x1024)');

  // --- Favicon (48x48) ---
  const fullIcon = await sharp({
    create: { width: iconSize, height: iconSize, channels: 4, background: DARK_BG }
  })
    .composite([{ input: iconBean, gravity: 'centre' }])
    .png()
    .toBuffer();

  await sharp(fullIcon)
    .resize(48, 48)
    .png()
    .toFile(join(assetsDir, 'favicon.png'));
  console.log('✓ favicon.png (48x48)');

  console.log('\nAll icons generated from greenbean.gif!');
}

generate().catch(console.error);
