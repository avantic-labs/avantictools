import jsQR from "jsqr";
import { describe, expect, it } from "vitest";
import {
  createQrCode,
  QR_MAX_BYTES,
  qrInputByteLength,
  validateQrInput,
} from "../../lib/utilities/qr";

function decodeQr(input: string): string | undefined {
  const { modules } = createQrCode(input);
  const quietZone = 4;
  const scale = 4;
  const width = (modules.size + quietZone * 2) * scale;
  const pixels = new Uint8ClampedArray(width * width * 4).fill(255);

  for (let row = 0; row < modules.size; row += 1) {
    for (let column = 0; column < modules.size; column += 1) {
      if (!modules.get(row, column)) continue;

      for (let y = 0; y < scale; y += 1) {
        for (let x = 0; x < scale; x += 1) {
          const pixel =
            ((row + quietZone) * scale + y) * width +
            (column + quietZone) * scale +
            x;
          pixels[pixel * 4] = 0;
          pixels[pixel * 4 + 1] = 0;
          pixels[pixel * 4 + 2] = 0;
        }
      }
    }
  }

  return jsQR(pixels, width, width, { inversionAttempts: "dontInvert" })?.data;
}

describe("QR input validation", () => {
  it.each(["", "   ", "\n\t"])("rejects empty or whitespace-only input", (input) => {
    expect(validateQrInput(input)).toMatch(/Enter text or a URL/);
    expect(() => createQrCode(input)).toThrow(/Enter text or a URL/);
  });

  it("counts UTF-8 bytes rather than JavaScript string length", () => {
    expect(qrInputByteLength("hello")).toBe(5);
    expect(qrInputByteLength("é")).toBe(2);
    expect(qrInputByteLength("漢")).toBe(3);
    expect(qrInputByteLength("😀")).toBe(4);
  });

  it("accepts the maximum byte payload with medium error correction", () => {
    const input = "x".repeat(QR_MAX_BYTES);
    expect(validateQrInput(input)).toBeNull();
    const qr = createQrCode(input);
    expect(qr.version).toBe(40);
    expect(qr.errorCorrectionLevel).toEqual({ bit: 0 });
    expect(decodeQr(input)).toBe(input);
  });

  it("rejects a payload one byte above the supported capacity", () => {
    const input = "x".repeat(QR_MAX_BYTES + 1);
    expect(validateQrInput(input)).toMatch(/2,331 UTF-8 bytes/);
    expect(() => createQrCode(input)).toThrow(/2,331 UTF-8 bytes/);
  });

  it("applies the capacity limit to Unicode without silently truncating it", () => {
    const maximum = "😀".repeat(582) + "abc";
    expect(qrInputByteLength(maximum)).toBe(QR_MAX_BYTES);
    expect(createQrCode(maximum).version).toBe(40);
    expect(validateQrInput("😀".repeat(583))).toMatch(/2,331 UTF-8 bytes/);
  });
});

describe("QR encoding", () => {
  it.each([
    "https://example.com/path?query=hello%20world&next=%2Fhome#section",
    "Plain text that is not a URL",
    "  Keep leading and trailing whitespace.\n\t ",
    "Hello, 世界! مرحباً 😀 café e\u0301",
    "<script>alert('text only')</script>",
  ])("round-trips text through an independent QR decoder: %s", (input) => {
    expect(decodeQr(input)).toBe(input);
  });

  it("is deterministic for the same input and configuration", () => {
    expect(createQrCode("repeat me").modules.data).toEqual(
      createQrCode("repeat me").modules.data,
    );
  });
});
