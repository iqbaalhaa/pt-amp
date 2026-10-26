import type { Locale } from "@/lib/i18n";

// Post date as on /blog: "27 Oktober 2026" (en: "27 October 2026").
export function formatPostDate(iso: string, locale: Locale = "id") {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
