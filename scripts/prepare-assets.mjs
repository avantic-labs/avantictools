import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
await mkdir(path.join(root, "public/vendor"), { recursive: true });
await mkdir(path.join(root, "public/fonts"), { recursive: true });
await cp(
  path.join(root, "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs"),
  path.join(root, "public/vendor/pdf.worker.min.mjs"),
);
for (const folder of ["standard_fonts", "cmaps", "wasm"])
  await cp(
    path.join(root, "node_modules/pdfjs-dist", folder),
    path.join(root, "public/vendor", folder),
    { recursive: true },
  );
for (const name of [
  "inter-latin-400-normal.woff",
  "inter-latin-600-normal.woff",
])
  await cp(
    path.join(root, "node_modules/@fontsource/inter/files", name),
    path.join(root, "public/fonts", name),
  );
await cp(
  path.join(root, "assets/fonts/Inter-Regular.ttf"),
  path.join(root, "public/fonts/Inter-Regular.ttf"),
);
// Only crop whitespace/lockup and resize the supplied art; never redraw/recolor it.
const original = path.join(root, "public/avantic-tools-logo.jpg");
const metadata = await sharp(original).metadata();
const scale = metadata.width / 1262;
const mark = await sharp(original)
  .extract({
    left: Math.round(220 * scale),
    top: Math.round(220 * scale),
    width: Math.round(820 * scale),
    height: Math.round(820 * scale),
  })
  .png()
  .toBuffer();
await sharp(mark)
  .resize(256, 256)
  .toFile(path.join(root, "public/avantic-tools-mark.png"));
await sharp(mark).resize(512, 512).toFile(path.join(root, "app/icon.png"));
await sharp(mark)
  .resize(180, 180)
  .toFile(path.join(root, "app/apple-icon.png"));
const icon = await sharp(mark).resize(32, 32).ensureAlpha().png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = header[7] = 32;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(icon.length, 14);
header.writeUInt32LE(22, 18);
const { writeFile } = await import("node:fs/promises");
await writeFile(
  path.join(root, "app/favicon.ico"),
  Buffer.concat([header, icon]),
);
