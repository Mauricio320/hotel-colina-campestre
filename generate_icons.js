
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const logoPath = 'public/images/logo-icon.png';
const publicDir = 'public';
const backgroundColor = '#009966';

const icons = [
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'maskable-icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'favicon.png', size: 32 }, // New favicon replacing the old .ico
];

async function generateIcons() {
  try {
    const logo = await sharp(logoPath).metadata();
    const logoAspectRatio = logo.width / logo.height;

    for (const icon of icons) {
      const outputPath = path.join(publicDir, icon.name);

      // logo size (80% of icon size for padding)
      const logoSize = Math.floor(icon.size * 0.8);
      let logoWidth, logoHeight;

      if (logoAspectRatio > 1) {
        logoWidth = logoSize;
        logoHeight = Math.floor(logoSize / logoAspectRatio);
      } else {
        logoHeight = logoSize;
        logoWidth = Math.floor(logoSize * logoAspectRatio);
      }

      const resizedLogoBuffer = await sharp(logoPath)
        .resize({ width: logoWidth, height: logoHeight })
        .toBuffer();

      const baseImage = sharp({
        create: {
          width: icon.size,
          height: icon.size,
          channels: 4,
          background: backgroundColor
        }
      });

      await baseImage
        .composite([{ input: resizedLogoBuffer, gravity: 'center' }])
        .png()
        .toFile(outputPath);

      console.log(`Generated: ${icon.name}`);
    }

    console.log('PWA icons regeneration complete with new background color.');

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
