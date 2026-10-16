export type GenerationProvider = "anthropic";
export type DetectionProvider = string;

export type GenerationWorkflow = "humanizer" | "audit";
export type DetectionWorkflow = "detector";

export type GenerateInput = {
  prompt: string;
  context?: Record<string, unknown>;
};

export type GenerateOptions = {
  provider?: GenerationProvider;
  workflow: GenerationWorkflow;
};

export type GenerateResult = {
  text: string;
  provider: GenerationProvider;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
  };
};

export type DetectionCategory =
  | "likely_ai_generated"
  | "mixed"
  | "likely_human_written";

export type DetectInput = {
  text: string;
};

export type DetectOptions = {
  provider?: DetectionProvider;
  workflow: DetectionWorkflow;
};

export type DetectResult = {
  category: DetectionCategory;
  explanation: string;
  provider: DetectionProvider;
  /** Internal provider confidence may exist, but Day-1 UI must not present a bare precision percentage. */
  internalConfidence?: number;
  usage?: {
    units?: number;
    estimatedCost?: number;
  };
};
