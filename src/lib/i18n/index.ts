import { id } from "./id";
import { en } from "./en";

export type Locale = "id" | "en";
export type { Dictionary } from "./id";

const dictionaries = { id, en };

// Public pages that have an English version under /en.
export const EN_PATHS = ["/", "/about", "/products", "/contact", "/gallery"];

export function getDictionary(locale: Locale = "id") {
  return dictionaries[locale];
}

export function getLocaleFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "id";
}

// Path for the given locale; links without an English version (blog, login) stay Indonesian.
export function localePath(locale: Locale, path: string) {
  if (locale === "id") return path;
  const [base, rest] = splitPath(path);
  if (!EN_PATHS.includes(base)) return path;
  return (base === "/" ? "/en" : `/en${base}`) + rest;
}

// Counterpart URL in the other language, for the ID/EN switcher.
export function switchLocalePath(pathname: string, target: Locale) {
  const current = getLocaleFromPath(pathname);
  const idPath = current === "en" ? pathname.slice(3) || "/" : pathname;
  if (target === "id") return idPath;
  return EN_PATHS.includes(idPath) ? localePath("en", idPath) : "/en";
}

// hreflang alternates for Next metadata (idPath = Indonesian path, e.g. "/about").
export function languageAlternates(idPath: string) {
  const enPath = localePath("en", idPath);
  return {
    languages: { id: idPath, en: enPath, "x-default": idPath },
  };
}

function splitPath(path: string): [string, string] {
  const i = path.search(/[?#]/);
  return i === -1 ? [path, ""] : [path.slice(0, i) || "/", path.slice(i)];
}
