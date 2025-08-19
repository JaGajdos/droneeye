const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Simple arg parser for --key value or --key=value
function getArgValue(key, defaultValue) {
  const args = process.argv.slice(2);
  const longKey = `--${key}`;
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token === longKey) {
      const candidate = args[i + 1];
      if (candidate && !candidate.startsWith('--')) {
        return candidate;
      }
      return defaultValue;
    }
    if (token.startsWith(`${longKey}=`)) {
      return token.substring(longKey.length + 1);
    }
  }
  return defaultValue;
}

function hasNamedArg(key) {
  const args = process.argv.slice(2);
  const longKey = `--${key}`;
  return args.some(t => t === longKey || t.startsWith(`${longKey}=`));
}

// Named args first
let inputDirRaw = getArgValue('src', 'src/assets/images-sources');
let outputDirRaw = getArgValue('dest', 'src/assets/images');

// Fallback: positional args (e.g., when npm forwards only values without --src/--dest)
const argv = process.argv.slice(2).filter(t => !t.startsWith('--'));

// If only one positional arg and no named flags, interpret it as DEST (common case)
if (!hasNamedArg('src') && !hasNamedArg('dest') && argv.length === 1) {
  outputDirRaw = argv[0];
} else {
  if (!hasNamedArg('src') && argv[0]) {
    inputDirRaw = argv[0];
  }
  if (!hasNamedArg('dest') && argv[1]) {
    outputDirRaw = argv[1];
  }
}

const inputDir = path.resolve(process.cwd(), inputDirRaw);
const outputDir = path.resolve(process.cwd(), outputDirRaw);

if (!fs.existsSync(inputDir)) {
  console.error(`Vstupný priečinok neexistuje: ${inputDir}`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

console.log(`Zdroj: ${inputDir}`);
console.log(`Výstup: ${outputDir}`);

fs.readdirSync(inputDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (!supportedExtensions.has(ext)) {
    return;
  }

  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, path.parse(file).name + '.webp');

  sharp(inputPath)
    .resize({ width: 1024 }) // zmenší obrázok ak je väčší, inak ponechá
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => console.log(`Optimalizované: ${file} → ${outputPath}`))
    .catch(err => console.error(`Chyba pri ${file}:`, err));
});