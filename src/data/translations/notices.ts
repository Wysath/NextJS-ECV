import notices1 from "@/data/translations/notices-1.json";
import notices2 from "@/data/translations/notices-2.json";
import notices3 from "@/data/translations/notices-3.json";

// French translations of the API's English notices, keyed by slug. Same HTML tags as the source, so
// PaintingDescription renders them unchanged. Split in three files only because they were translated in batches.
export const NOTICE_TRANSLATIONS: Record<string, string> = { ...notices1, ...notices2, ...notices3 };
