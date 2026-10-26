import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { DEFAULT_IMAGES, DEAD_SEED_IMAGES } from "./default-images";

test("every default image exists in public/", () => {
  for (const src of Object.values(DEFAULT_IMAGES)) {
    assert.ok(existsSync(`public${src}`), src);
  }
});

test("dead seed URLs map to local images", () => {
  const local = new Set<string>(Object.values(DEFAULT_IMAGES));
  for (const src of Object.values(DEAD_SEED_IMAGES)) assert.ok(local.has(src), src);
});

test("seed and home fallbacks no longer use remote stock images", () => {
  for (const file of [
    "prisma/seeds/content-seed.ts",
    "src/components/pages/home/StaticProductCards.tsx",
    "src/components/pages/products/ProductCatalogImage.tsx",
  ]) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /unsplash\.com|pexels\.com/, file);
  }
});
