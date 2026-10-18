import QRCode, { type QRCodeSegment } from "qrcode";

// Version 40's byte capacity at medium error correction. Force byte mode so
// the same UTF-8 limit applies to URLs, ordinary text, and Unicode input.
export const QR_MAX_BYTES = 2_331;

const QR_OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 4,
  scale: 6,
  color: { dark: "#000000ff", light: "#ffffffff" },
};

export function qrInputByteLength(input: string): number {
  return new TextEncoder().encode(input).length;
}

export function validateQrInput(input: string): string | null {
  if (input.trim().length === 0) {
    return "Enter text or a URL to generate a QR code.";
  }

  if (qrInputByteLength(input) > QR_MAX_BYTES) {
    return "Use no more than 2,331 UTF-8 bytes. Emoji and some other characters use more than one byte each.";
  }

  return null;
}

function getQrSegments(input: string): QRCodeSegment[] {
  const error = validateQrInput(input);

  if (error) {
    throw new Error(error);
  }

  // Preserve the input verbatim, including intentional surrounding whitespace.
  return [{ data: new TextEncoder().encode(input), mode: "byte" }];
}

export function createQrCode(input: string) {
  return QRCode.create(getQrSegments(input), QR_OPTIONS);
}

export async function generateQrPng(input: string): Promise<string> {
  // qrcode's browser entry point renders a local canvas to a PNG data URL.
  return QRCode.toDataURL(getQrSegments(input), QR_OPTIONS);
}
