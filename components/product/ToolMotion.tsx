import { ToolMotionSurface } from "./ToolMotionSurface";
import type { ToolId } from "@/data/tools";

// Abstract marks only: no document, text, date or other workspace input is read.
const scenes: Record<ToolId, React.ReactNode> = {
  "scan-to-pdf": (
    <>
      <path d="M24 44V24h20m72 0h20v20m0 72v20h-20m-72 0H24v-20" />
      <path className="motion-detail" d="M38 48h84" />
    </>
  ),
  "pdf-organizer": (
    <>
      {[0, 1, 2].map((index) => (
        <rect
          key={index}
          className={`motion-detail motion-page-${index}`}
          x={30 + index * 25}
          y={32 + index * 10}
          width="52"
          height="72"
          rx="3"
        />
      ))}
    </>
  ),
  "file-compressor": (
    <>
      <path d="M30 48V28h20m60 0h20v20m0 64v20h-20m-60 0H30v-20" />
      <g className="motion-detail">
        {[56, 80, 104].map((x) => (
          <circle key={x} cx={x} cy="80" r="3" />
        ))}
      </g>
    </>
  ),
  "application-photo-signature-prep": (
    <>
      <rect x="47" y="34" width="66" height="92" rx="2" />
      <path
        className="motion-detail"
        d="M34 54V22h32m28 0h32v32m0 52v32H94m-28 0H34v-32"
      />
    </>
  ),
  "word-counter": (
    <>
      {[52, 78, 104].map((y, index) => (
        <g key={y} className={`motion-detail motion-row-${index}`}>
          <circle cx="32" cy={y} r="2" />
          <path d={`M46 ${y}h${76 - index * 16}`} />
        </g>
      ))}
    </>
  ),
  "character-counter": (
    <>
      {Array.from({ length: 12 }, (_, index) => (
        <rect
          key={index}
          className={`motion-detail motion-row-${index % 3}`}
          x={34 + (index % 4) * 26}
          y={42 + Math.floor(index / 4) * 28}
          width="12"
          height="16"
          rx="1"
        />
      ))}
    </>
  ),
  "case-converter": (
    <>
      <path d="M28 114h104" />
      <g className="motion-detail">
        <path d="M42 100V44m16 56V60m28 40V60m16 40V44" />
      </g>
    </>
  ),
  "qr-code-generator": (
    <>
      <path d="M30 30h34v34H30zm66 0h34v34H96zM30 96h34v34H30z" />
      <g className="motion-detail">
        <path d="M96 98h14v14h20v18h-18m-16-12v12" />
        <circle cx="47" cy="47" r="3" />
        <circle cx="113" cy="47" r="3" />
        <circle cx="47" cy="113" r="3" />
      </g>
    </>
  ),
  "password-generator": (
    <>
      <circle cx="80" cy="80" r="40" />
      <g className="motion-detail">
        <path d="M80 26a54 54 0 0 1 54 54m-54 54a54 54 0 0 1-54-54" />
        <circle cx="80" cy="26" r="3" />
        <circle cx="80" cy="134" r="3" />
      </g>
    </>
  ),
  "invoice-receipt-maker": (
    <>
      <path d="M42 24h76v112H42zM56 46h36m-36 65h48" />
      <g className="motion-detail">
        <path d="M56 68h32m12 0h4M56 84h22m22 0h4" />
      </g>
    </>
  ),
  "percentage-discount-calculator": (
    <>
      <path d="m50 116 60-72" />
      <circle className="motion-detail" cx="48" cy="48" r="16" />
      <circle className="motion-detail motion-row-1" cx="112" cy="112" r="16" />
    </>
  ),
  "age-date-calculator": (
    <>
      <rect x="32" y="38" width="96" height="90" rx="3" />
      <path d="M32 62h96M54 30v16m52-16v16" />
      <g className="motion-detail">
        {[52, 80, 108].map((x) => (
          <circle key={x} cx={x} cy="88" r="3" />
        ))}
      </g>
    </>
  ),
};

export function ToolMotion({ tool }: { tool: ToolId }) {
  return (
    <ToolMotionSurface tool={tool}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        focusable="false"
      >
        {scenes[tool]}
      </svg>
    </ToolMotionSurface>
  );
}
