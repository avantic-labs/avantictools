// Founder-approved production origin (Work Order 004). Never derive this from
// a request host, branch URL or VERCEL_URL. Preview remains non-indexable.
export const SITE_URL = "https://avantictools.vercel.app";
export const SITE_NAME = "AVANTIC Tools";

export const CANONICAL_PROJECT_ID = "prj_NJeADvuAPWxgtndznix13zjEeSkO";
export const ALLOW_INDEXING =
  process.env.VERCEL_ENV !== "preview" &&
  (!process.env.VERCEL_PROJECT_ID ||
    process.env.VERCEL_PROJECT_ID === CANONICAL_PROJECT_ID);
