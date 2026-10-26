// Run: ./node_modules/.bin/tsx --test src/lib/i18n/i18n.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getDictionary,
  getLocaleFromPath,
  languageAlternates,
  localePath,
  switchLocalePath,
} from "./index";

test("getLocaleFromPath", () => {
  assert.equal(getLocaleFromPath("/"), "id");
  assert.equal(getLocaleFromPath("/about"), "id");
  assert.equal(getLocaleFromPath("/en"), "en");
  assert.equal(getLocaleFromPath("/en/products"), "en");
  assert.equal(getLocaleFromPath("/english"), "id");
});

test("localePath keeps ID paths and prefixes translated EN pages only", () => {
  assert.equal(localePath("id", "/about"), "/about");
  assert.equal(localePath("en", "/"), "/en");
  assert.equal(localePath("en", "/about"), "/en/about");
  assert.equal(localePath("en", "#about"), "/en#about");
  assert.equal(localePath("en", "/contact?product=A%20B"), "/en/contact?product=A%20B");
  assert.equal(localePath("en", "/blog"), "/blog");
  assert.equal(localePath("en", "/login"), "/login");
});

test("switchLocalePath maps to the counterpart page", () => {
  assert.equal(switchLocalePath("/", "en"), "/en");
  assert.equal(switchLocalePath("/gallery", "en"), "/en/gallery");
  assert.equal(switchLocalePath("/en/gallery", "id"), "/gallery");
  assert.equal(switchLocalePath("/en", "id"), "/");
  assert.equal(switchLocalePath("/en", "en"), "/en");
  assert.equal(switchLocalePath("/about", "id"), "/about");
  // no English blog yet: go to English home
  assert.equal(switchLocalePath("/blog/some-post", "en"), "/en");
});

test("languageAlternates gives hreflang id/en/x-default", () => {
  assert.deepEqual(languageAlternates("/about"), {
    languages: { id: "/about", en: "/en/about", "x-default": "/about" },
  });
  assert.equal(languageAlternates("/").languages.en, "/en");
});

test("dictionaries have the same keys and no empty strings", () => {
  const keys = (o: unknown, prefix = ""): string[] =>
    typeof o === "object" && o !== null
      ? Object.entries(o).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
      : [prefix + (o === "" ? "EMPTY" : "")];
  const idKeys = keys(getDictionary("id"));
  assert.deepEqual(keys(getDictionary("en")), idKeys);
  assert.ok(!idKeys.some((k) => k.endsWith("EMPTY")));
});
