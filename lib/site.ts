// Verified existing production alias. An approved custom domain can replace it
// via NEXT_PUBLIC_SITE_URL without changing tool routes or Preview canonicals.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://avantictools.vercel.app"
).replace(/\/$/, "");
export const SITE_NAME = "AVANTIC Tools";
