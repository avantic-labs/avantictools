import { FILE_LIMITS, FileProblem, yieldToBrowser } from "./shared";
export type Point = { x: number; y: number };
export type PageCorners = readonly [Point, Point, Point, Point];
export const FULL_PAGE_CORNERS: PageCorners = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];
export function validateCorners(points: PageCorners) {
  if (
    points.some(
      (p) =>
        !Number.isFinite(p.x) ||
        !Number.isFinite(p.y) ||
        p.x < 0 ||
        p.x > 100 ||
        p.y < 0 ||
        p.y > 100,
    )
  )
    throw new FileProblem("Keep all four page corners inside the photo.");
  for (let i = 0; i < 4; i++) {
    const a = points[i],
      b = points[(i + 1) % 4],
      c = points[(i + 2) % 4];
    if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) < 0.1)
      throw new FileProblem(
        "Place the page corners in order without crossing the edges.",
      );
  }
}
/** Maps a point on a unit rectangle to the source quadrilateral. */
export function perspectivePoint(
  points: PageCorners,
  u: number,
  v: number,
): Point {
  const { a, b, c, d, e, f, g, h } = coefficients(points);
  const divisor = g * u + h * v + 1;
  return { x: (a * u + b * v + c) / divisor, y: (d * u + e * v + f) / divisor };
}
function coefficients(points: PageCorners) {
  const [p0, p1, p2, p3] = points;
  const dx1 = p1.x - p2.x,
    dx2 = p3.x - p2.x,
    sx = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y,
    dy2 = p3.y - p2.y,
    sy = p0.y - p1.y + p2.y - p3.y;
  const denominator = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / denominator;
  const h = (dx1 * sy - sx * dy1) / denominator;
  return {
    a: p1.x - p0.x + g * p1.x,
    b: p3.x - p0.x + h * p3.x,
    c: p0.x,
    d: p1.y - p0.y + g * p1.y,
    e: p3.y - p0.y + h * p3.y,
    f: p0.y,
    g,
    h,
  };
}

export async function correctPerspective(
  image: ImageBitmap,
  points: PageCorners,
  signal?: AbortSignal,
): Promise<HTMLCanvasElement> {
  validateCorners(points);
  const sample = document.createElement("canvas");
  const output = document.createElement("canvas");
  const sourceScale = Math.min(
    1,
    Math.sqrt(FILE_LIMITS.canvasPixels / (image.width * image.height)),
  );
  sample.width = Math.max(1, Math.round(image.width * sourceScale));
  sample.height = Math.max(1, Math.round(image.height * sourceScale));
  const context = sample.getContext("2d", { willReadFrequently: true })!;
  try {
    context.drawImage(image, 0, 0, sample.width, sample.height);
    const source = context.getImageData(0, 0, sample.width, sample.height);
    const distance = (a: Point, b: Point) =>
      Math.hypot(
        ((a.x - b.x) * sample.width) / 100,
        ((a.y - b.y) * sample.height) / 100,
      );
    output.width = Math.max(
      1,
      Math.round(
        Math.max(
          distance(points[0], points[1]),
          distance(points[3], points[2]),
        ),
      ),
    );
    output.height = Math.max(
      1,
      Math.round(
        Math.max(
          distance(points[0], points[3]),
          distance(points[1], points[2]),
        ),
      ),
    );
    const scale = Math.min(
      1,
      Math.sqrt(FILE_LIMITS.canvasPixels / (output.width * output.height)),
    );
    output.width = Math.max(1, Math.round(output.width * scale));
    output.height = Math.max(1, Math.round(output.height * scale));
    const targetContext = output.getContext("2d")!;
    const target = targetContext.createImageData(output.width, output.height);
    const { a, b, c, d, e, f, g, h } = coefficients(points);
    for (let row = 0; row < output.height; row++) {
      if (row % 32 === 0) {
        if (signal?.aborted) throw new DOMException("Stopped", "AbortError");
        await yieldToBrowser();
      }
      for (let column = 0; column < output.width; column++) {
        const u = column / Math.max(1, output.width - 1),
          v = row / Math.max(1, output.height - 1),
          divisor = g * u + h * v + 1;
        const x = Math.max(
          0,
          Math.min(
            sample.width - 1,
            (((a * u + b * v + c) / divisor) * (sample.width - 1)) / 100,
          ),
        );
        const y = Math.max(
          0,
          Math.min(
            sample.height - 1,
            (((d * u + e * v + f) / divisor) * (sample.height - 1)) / 100,
          ),
        );
        const left = Math.floor(x),
          top = Math.floor(y),
          right = Math.min(left + 1, sample.width - 1),
          bottom = Math.min(top + 1, sample.height - 1);
        const fx = x - left,
          fy = y - top;
        for (let channel = 0; channel < 4; channel++)
          target.data[(row * output.width + column) * 4 + channel] =
            source.data[(top * sample.width + left) * 4 + channel] *
              (1 - fx) *
              (1 - fy) +
            source.data[(top * sample.width + right) * 4 + channel] *
              fx *
              (1 - fy) +
            source.data[(bottom * sample.width + left) * 4 + channel] *
              (1 - fx) *
              fy +
            source.data[(bottom * sample.width + right) * 4 + channel] *
              fx *
              fy;
      }
    }
    targetContext.putImageData(target, 0, 0);
    return output;
  } catch (error) {
    output.width = output.height = 0;
    throw error;
  } finally {
    sample.width = sample.height = 0;
  }
}
