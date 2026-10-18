export const categories = [
  {
    id: "files",
    name: "Files & Documents",
    description: "Turn pages and files into something ready to send.",
  },
  {
    id: "applications",
    name: "Images & Applications",
    description: "Make a photo or signature fit the portal’s requirements.",
  },
  {
    id: "writing",
    name: "Writing & Text",
    description: "Count, check and reshape your words.",
  },
  {
    id: "business",
    name: "Business",
    description: "Prepare the small things that keep work moving.",
  },
  {
    id: "everyday",
    name: "Everyday",
    description: "Quick answers for tasks that come up again and again.",
  },
] as const;
export type CategoryId = (typeof categories)[number]["id"];
export const tools = [
  {
    slug: "scan-to-pdf",
    name: "Scan to PDF",
    category: "files",
    description: "Turn photos into one clean PDF.",
    keywords: "camera scan document image photo pages pdf",
    icon: "scan",
    family: "files",
  },
  {
    slug: "pdf-organizer",
    name: "PDF Organizer",
    category: "files",
    description: "Combine, reorder and rotate PDF pages.",
    keywords: "merge join combine split remove delete rotate pdf pages",
    icon: "pdf",
    family: "files",
  },
  {
    slug: "file-compressor",
    name: "File Compressor",
    category: "files",
    description: "Make a file small enough to send.",
    keywords: "compress reduce size pdf jpeg jpg png webp mb kb",
    icon: "compress",
    family: "files",
  },
  {
    slug: "application-photo-signature-prep",
    name: "Application Photo & Signature Prep",
    category: "applications",
    description: "Make a photo or signature fit an online application.",
    keywords:
      "passport photo picture signature crop resize nysc school job immigration portal dimensions file size limit kb",
    icon: "image",
    family: "images",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    category: "writing",
    description: "Count words as you write or paste.",
    keywords: "words text essay writing count length",
    icon: "words",
    family: "text",
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    category: "writing",
    description: "Check the length of a message or piece of text.",
    keywords: "characters letters text unicode count length",
    icon: "text",
    family: "text",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    category: "writing",
    description: "Switch between lowercase, UPPERCASE and more.",
    keywords: "case upper lower title sentence capitals text",
    icon: "case",
    family: "text",
  },
  {
    slug: "invoice-receipt-maker",
    name: "Invoice & Receipt Maker",
    category: "business",
    description: "Create an invoice or sales receipt, ready to send.",
    keywords:
      "invoice receipt business naira ngn customer payment seller freelancer bank transfer",
    icon: "receipt",
    family: "business",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "business",
    description: "Make a QR code for a link or text.",
    keywords: "qr code barcode link url text",
    icon: "qr",
    family: "business",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    category: "everyday",
    description: "Create a strong password on your device.",
    keywords: "password secure random strong generator",
    icon: "key",
    family: "everyday",
  },
  {
    slug: "percentage-discount-calculator",
    name: "Percentage & Discount Calculator",
    category: "everyday",
    description: "Work out a percentage, price change or discount.",
    keywords:
      "percentage percent discount sale price saved increase decrease math calculator",
    icon: "percent",
    family: "everyday",
  },
  {
    slug: "age-date-calculator",
    name: "Age & Date Calculator",
    category: "everyday",
    description: "Find an age or the time between two dates.",
    keywords:
      "age birthday birth date days months years until since difference calendar",
    icon: "calendar",
    family: "everyday",
  },
] as const;
export type Tool = (typeof tools)[number];
export type ToolId = Tool["slug"];
export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
export function toolRoute(slug: ToolId) {
  return `/tools/${slug}`;
}
export const comingSoon = [
  {
    name: "Extract Text from Image",
    group: "Files",
    description: "Copy text from a photo or scanned page.",
  },
  {
    name: "Image to PDF",
    group: "Files",
    description: "A direct conversion path for existing images.",
  },
  {
    name: "PDF to Images",
    group: "Files",
    description: "Save PDF pages as image files.",
  },
  {
    name: "AI Model / Prompt Comparator",
    group: "Roadmap",
    description: "Compare responses side by side.",
  },
  {
    name: "Startup Toolkit",
    group: "Roadmap",
    description: "Work through a business idea in one place.",
  },
  {
    name: "Brand Voice Consistency Checker",
    group: "Roadmap",
    description: "Check writing against a defined voice.",
  },
  {
    name: "Prompt Debugger",
    group: "Candidate",
    description: "A candidate for a future release.",
  },
] as const;
