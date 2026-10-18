import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
export const alt =
  "AVANTIC Tools — everyday tasks, sorted. A product of AVANTIC LABS.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OpenGraphImage() {
  const mark = await readFile(
    path.join(process.cwd(), "public/avantic-tools-mark.png"),
  );
  const font = await readFile(
    path.join(process.cwd(), "public/fonts/inter-latin-600-normal.woff"),
  );
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#F7F5EF",
          color: "#1F2430",
          padding: 64,
          alignItems: "center",
          gap: 64,
          fontFamily: "Inter",
        }}
      >
        <img
          src={`data:image/png;base64,${mark.toString("base64")}`}
          width={256}
          height={256}
          alt=""
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 32, color: "#4B6570" }}>AVANTIC Tools</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 64,
              lineHeight: 1.15,
            }}
          >
            <span>Everyday tasks,</span>
            <span>sorted.</span>
          </div>
          <div style={{ fontSize: 24 }}>A product of AVANTIC LABS.</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Inter", data: font, weight: 600, style: "normal" }],
    },
  );
}
