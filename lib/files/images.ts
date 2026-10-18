import {
  FILE_LIMITS,
  FileProblem,
  checkFileSize,
  QUALITY_PRESETS,
  type QualityPreset,
  yieldToBrowser,
} from "./shared";
import { correctPerspective, type PageCorners } from "./perspective";

export type Crop = { left: number; top: number; width: number; height: number };
export const FULL_CROP: Crop = { left: 0, top: 0, width: 100, height: 100 };
export type ImageSettings = {
  crop: Crop;
  rotation: number;
  straighten: number;
  mode: "original" | "clean" | "grayscale";
  trim?: boolean;
  corners?: PageCorners;
};
export const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
  crop: FULL_CROP,
  rotation: 0,
  straighten: 0,
  mode: "original",
};

export function validateCrop(crop: Crop) {
  if (
    ![crop.left, crop.top, crop.width, crop.height].every(Number.isFinite) ||
    crop.left < 0 ||
    crop.top < 0 ||
    crop.width < 1 ||
    crop.height < 1 ||
    crop.left + crop.width > 100.01 ||
    crop.top + crop.height > 100.01
  ) {
    throw new FileProblem(
      "Keep the crop inside the photo, with a width and height of at least 1%.",
    );
  }
}

export async function imageDimensions(
  file: Blob,
): Promise<{ width: number; height: number }> {
  checkFileSize(file, "image");
  const buffer = await file.slice(0, 262144).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let width = 0;
  let height = 0;
  if (
    bytes[0] === 137 &&
    bytes[1] === 80 &&
    bytes[2] === 78 &&
    bytes[3] === 71 &&
    bytes.length >= 24
  ) {
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 255) break;
      const marker = bytes[offset + 1];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0xff) {
        offset += 1;
        continue;
      }
      const length = view.getUint16(offset + 2);
      if (length < 2) break;
      if (
        [
          0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
          0xce, 0xcf,
        ].includes(marker)
      ) {
        height = view.getUint16(offset + 5);
        width = view.getUint16(offset + 7);
        break;
      }
      offset += length + 2;
    }
  } else if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    const kind = String.fromCharCode(...bytes.slice(12, 16));
    if (kind === "VP8X" && bytes.length >= 30) {
      width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    } else if (kind === "VP8 " && bytes.length >= 30) {
      width = view.getUint16(26, true) & 0x3fff;
      height = view.getUint16(28, true) & 0x3fff;
    } else if (kind === "VP8L" && bytes.length >= 25) {
      width = 1 + bytes[21] + ((bytes[22] & 0x3f) << 8);
      height =
        1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10);
    }
  }
  if (!width || !height)
    throw new FileProblem(
      "Choose a valid JPEG, PNG or WebP image. HEIC, SVG and animated files are not supported.",
    );
  if (width * height > FILE_LIMITS.imagePixels)
    throw new FileProblem(
      "This photo is too large to edit safely on a phone. Resize it below 24 megapixels and try again.",
    );
  if (width > 16384 || height > 16384)
    throw new FileProblem(
      "This image is too wide or tall for this device. Resize its longest side below 16,384 pixels.",
    );
  return { width, height };
}

export function canvasBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(
              new FileProblem(
                "Your browser could not create this image. Try a smaller size.",
              ),
            ),
      type,
      quality,
    ),
  );
}

export async function prepareImage(
  file: Blob,
  settings: ImageSettings = DEFAULT_IMAGE_SETTINGS,
  edge = 2400,
  signal?: AbortSignal,
): Promise<HTMLCanvasElement> {
  const dimensions = await imageDimensions(file);
  validateCrop(settings.crop);
  let image: ImageBitmap;
  try {
    image = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new FileProblem(
      "This image could not be opened. Export it as JPEG or PNG and try again.",
    );
  }
  const canvas = document.createElement("canvas");
  let corrected: HTMLCanvasElement | null = null;
  try {
    if (settings.corners)
      corrected = await correctPerspective(image, settings.corners, signal);
    const source = corrected ?? image;
    // ImageBitmap applies camera orientation, so use its dimensions after decoding.
    const sourceW = source.width || dimensions.width;
    const sourceH = source.height || dimensions.height;
    const crop = settings.crop;
    const sw = (sourceW * crop.width) / 100;
    const sh = (sourceH * crop.height) / 100;
    const angle = ((settings.rotation + settings.straighten) * Math.PI) / 180;
    const bw = Math.abs(sw * Math.cos(angle)) + Math.abs(sh * Math.sin(angle));
    const bh = Math.abs(sw * Math.sin(angle)) + Math.abs(sh * Math.cos(angle));
    const scale = Math.min(
      1,
      edge / Math.max(bw, bh),
      Math.sqrt(FILE_LIMITS.canvasPixels / (bw * bh)),
    );
    canvas.width = Math.max(1, Math.round(bw * scale));
    canvas.height = Math.max(1, Math.round(bh * scale));
    const context = canvas.getContext("2d", {
      willReadFrequently: settings.mode !== "original" || settings.trim,
    });
    if (!context)
      throw new FileProblem("Image editing is unavailable in this browser.");
    context.fillStyle = "#ffffff";
    // JPEG exports and scans use a white canvas; PNG transparency is preserved in resizing below.
    if (settings.rotation % 90 !== 0 || settings.straighten !== 0)
      context.fillRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(angle);
    context.drawImage(
      source,
      (sourceW * crop.left) / 100,
      (sourceH * crop.top) / 100,
      sw,
      sh,
      (-sw * scale) / 2,
      (-sh * scale) / 2,
      sw * scale,
      sh * scale,
    );
    context.resetTransform();
    if (settings.mode !== "original") {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        if (i % 262144 === 0) {
          if (signal?.aborted) throw new DOMException("Stopped", "AbortError");
          await yieldToBrowser();
        }
        let gray =
          0.2126 * pixels.data[i] +
          0.7152 * pixels.data[i + 1] +
          0.0722 * pixels.data[i + 2];
        if (settings.mode === "clean")
          gray = Math.max(0, Math.min(255, (gray - 128) * 1.65 + 150));
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = gray;
      }
      context.putImageData(pixels, 0, 0);
    }
    if (settings.trim) return trimMargins(canvas);
    return canvas;
  } catch (error) {
    canvas.width = canvas.height = 0;
    throw error;
  } finally {
    image.close();
    if (corrected) corrected.width = corrected.height = 0;
  }
}

function trimMargins(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = canvas.getContext("2d")!;
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  let left = canvas.width;
  let right = -1;
  let top = canvas.height;
  let bottom = -1;
  for (let y = 0; y < canvas.height; y++)
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (
        pixels.data[i + 3] > 32 &&
        Math.min(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]) < 220
      ) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  if (right < left) {
    canvas.width = canvas.height = 0;
    throw new FileProblem(
      "No dark signature was found. Use a clearer image or turn off trimming.",
    );
  }
  const padding = 8;
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(canvas.width - 1, right + padding);
  bottom = Math.min(canvas.height - 1, bottom + padding);
  const result = document.createElement("canvas");
  result.width = right - left + 1;
  result.height = bottom - top + 1;
  result
    .getContext("2d")!
    .drawImage(
      canvas,
      left,
      top,
      result.width,
      result.height,
      0,
      0,
      result.width,
      result.height,
    );
  canvas.width = canvas.height = 0;
  return result;
}

export async function fitImage(
  canvas: HTMLCanvasElement,
  options: {
    width: number;
    height: number;
    type: "image/jpeg" | "image/png";
    maxBytes?: number;
    fit?: "contain" | "cover";
  },
): Promise<Blob> {
  const { width, height, type, maxBytes } = options;
  if (
    ![width, height].every((n) => Number.isInteger(n) && n > 0 && n <= 6000) ||
    width * height > FILE_LIMITS.canvasPixels
  )
    throw new FileProblem(
      "Use whole-number dimensions up to 6,000 pixels, with no more than 4 million pixels in total.",
    );
  if (
    maxBytes !== undefined &&
    (!Number.isFinite(maxBytes) ||
      maxBytes < 1024 ||
      maxBytes > 20 * 1024 * 1024)
  )
    throw new FileProblem("Choose a maximum size from 1 KB to 20,480 KB.");
  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  try {
    const context = output.getContext("2d")!;
    if (type === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    const ratio =
      options.fit === "cover"
        ? Math.max(width / canvas.width, height / canvas.height)
        : Math.min(width / canvas.width, height / canvas.height);
    const drawnWidth = canvas.width * ratio;
    const drawnHeight = canvas.height * ratio;
    context.drawImage(
      canvas,
      (width - drawnWidth) / 2,
      (height - drawnHeight) / 2,
      drawnWidth,
      drawnHeight,
    );
    const result = await canvasBlob(output, type, 0.95);
    if (!maxBytes || result.size <= maxBytes) return result;
    if (type === "image/png")
      throw new FileProblem(
        "PNG cannot meet that size at these exact dimensions. Choose JPG, a larger limit or smaller dimensions.",
      );
    let low = 0.1;
    let high = 0.95;
    let best: Blob | null = await canvasBlob(output, type, 0.1);
    if (best.size > maxBytes)
      throw new FileProblem(
        "That file limit is too small at these exact dimensions. Increase the KB limit or reduce the dimensions.",
      );
    for (let attempt = 0; attempt < 8; attempt++) {
      const quality = (low + high) / 2;
      const candidate = await canvasBlob(output, type, quality);
      if (candidate.size <= maxBytes) {
        best = candidate;
        low = quality;
      } else high = quality;
    }
    if (!best)
      throw new FileProblem(
        "That file limit is too small at these exact dimensions. Increase the KB limit or reduce the dimensions.",
      );
    return best;
  } finally {
    output.width = output.height = 0;
  }
}

export async function compressImage(
  file: Blob,
  preset: QualityPreset,
): Promise<Blob> {
  const options = QUALITY_PRESETS[preset];
  const canvas = await prepareImage(file, DEFAULT_IMAGE_SETTINGS, options.edge);
  try {
    const type =
      file.type === "image/png"
        ? "image/png"
        : file.type === "image/webp"
          ? "image/webp"
          : "image/jpeg";
    if (type === "image/png") {
      const context = canvas.getContext("2d")!;
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pixels.data.length; i += 4)
        for (let c = 0; c < 3; c++)
          pixels.data[i + c] =
            Math.round(pixels.data[i + c] / options.colors) * options.colors;
      context.putImageData(pixels, 0, 0);
    }
    await yieldToBrowser();
    const result = await canvasBlob(canvas, type, options.quality);
    return result.size < file.size ? result : file;
  } finally {
    canvas.width = canvas.height = 0;
  }
}
