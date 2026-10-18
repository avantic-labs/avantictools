import {
  ScanLine,
  Files,
  FileDown,
  Image,
  WholeWord,
  TextCursorInput,
  CaseSensitive,
  ReceiptText,
  QrCode,
  KeyRound,
  Percent,
  CalendarDays,
} from "lucide-react";
import type { Tool } from "@/data/tools";
const icons = {
  scan: ScanLine,
  pdf: Files,
  compress: FileDown,
  image: Image,
  words: WholeWord,
  text: TextCursorInput,
  case: CaseSensitive,
  receipt: ReceiptText,
  qr: QrCode,
  key: KeyRound,
  percent: Percent,
  calendar: CalendarDays,
};
export function ToolIcon({ name }: { name: Tool["icon"] }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" size={24} strokeWidth={1.5} />;
}
