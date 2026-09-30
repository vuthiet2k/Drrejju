const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const SCRATCH = "C:/Users/user/AppData/Local/Temp/claude/E--METATWIN-dtwin-travel/98771a00-c386-4039-b6e5-2c1417ea1767/scratchpad";
const MAX_DIM = 1920, JPEG_QUALITY = 82, PNG_QUALITY = 80;

async function hasRealAlpha(img) {
  const meta = await img.metadata();
  if (!meta.hasAlpha) return false;
  const stats = await img.clone().stats();
  const a = stats.channels[stats.channels.length - 1];
  return a.min < 255;
}

async function processFile(filePath) {
  const before = fs.statSync(filePath).size;
  const ext = path.extname(filePath);
  const isPng = /\.png$/i.test(ext);
  const img = sharp(filePath, { failOn: "none" });
  const meta = await img.metadata();
  const needsResize = Math.max(meta.width || 0, meta.height || 0) > MAX_DIM;
  const resized = needsResize
    ? img.clone().resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
    : img.clone();
  let keepPng = false;
  if (isPng) keepPng = await hasRealAlpha(sharp(filePath));
  let outPath = filePath, buffer;
  if (keepPng) {
    buffer = await resized.png({ quality: PNG_QUALITY, compressionLevel: 9, palette: true }).toBuffer();
  } else {
    buffer = await resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    outPath = filePath.replace(/\.(png|jpe?g)$/i, ".jpg");
  }
  fs.writeFileSync(outPath, buffer);
  if (outPath !== filePath) fs.unlinkSync(filePath);
  return { before, after: buffer.length, outPath };
}

(async () => {
  for (const f of ["test1.JPG", "test2.png"]) {
    const r = await processFile(path.join(SCRATCH, "imgtest", f));
    console.log(f, (r.before / 1024).toFixed(0) + "KB ->", (r.after / 1024).toFixed(0) + "KB ->", r.outPath);
  }
})();
