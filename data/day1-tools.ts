export type ToolCategory = "ai" | "productivity";
export type WorkflowType = "single" | "connected";
export type ToolStatus = "live" | "hidden";

export type Day1Tool = {
  slug: string;
  name: string;
  category: ToolCategory;
  workflowType: WorkflowType;
  status: ToolStatus;
  route: string;
  description: string;
};

export const day1Tools: readonly Day1Tool[] = [
  {
    slug: "detector-humanizer",
    name: "AI Detector + Humanizer",
    category: "ai",
    workflowType: "connected",
    status: "live",
    route: "/tools/detector-humanizer",
    description:
      "Analyze writing, identify improvement areas, improve clarity and naturalness, then review and re-check.",
  },
  {
    slug: "ai-readiness-audit",
    name: "AI Readiness Audit",
    category: "ai",
    workflowType: "connected",
    status: "live",
    route: "/tools/ai-readiness-audit",
    description:
      "Assess where AI and automation can create the most practical value for your business.",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    category: "productivity",
    workflowType: "single",
    status: "live",
    route: "/tools/word-counter",
    description: "Count words instantly without sending your text to a server.",
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    category: "productivity",
    workflowType: "single",
    status: "live",
    route: "/tools/character-counter",
    description: "Count characters locally in your browser.",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    category: "productivity",
    workflowType: "single",
    status: "live",
    route: "/tools/case-converter",
    description: "Convert text casing quickly with client-side processing.",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "productivity",
    workflowType: "single",
    status: "live",
    route: "/tools/qr-code-generator",
    description: "Generate QR codes for common text and link workflows.",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    category: "productivity",
    workflowType: "single",
    status: "live",
    route: "/tools/password-generator",
    description:
      "Generate passwords locally so generated values never need to transit a server.",
  },
] as const;

export const liveDay1Tools = day1Tools.filter((tool) => tool.status === "live");

export const day1Categories = [
  {
    id: "ai" as const,
    label: "AI Tools",
    description: "Connected AI workflows for analysis, improvement and readiness.",
  },
  {
    id: "productivity" as const,
    label: "Productivity & Utility Tools",
    description: "Fast deterministic utilities designed for zero-friction daily use.",
  },
] as const;
