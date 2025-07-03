const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'src/assets/images-sources';
const outputDir = 'src/assets/images';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, path.parse(file).name + '.webp');

  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    sharp(inputPath)
      .resize({ width: 1024 }) // zmenší obrázok ak je väčší, inak ponechá
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() => console.log(`Optimalizované: ${file} → ${outputPath}`))
      .catch(err => console.error(`Chyba pri ${file}:`, err));
  }
});