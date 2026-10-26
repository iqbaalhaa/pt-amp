import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  DEFAULT_IMAGES,
  DEAD_SEED_IMAGES,
  replaceDeadImage,
  replaceDeadSlideMedia,
} from "./default-images";

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
    "src/components/Gallery.tsx",
  ]) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /unsplash\.com|pexels\.com/, file);
  }
});

test("dead seeded hero media is replaced at render time", () => {
  const dead = Object.keys(DEAD_SEED_IMAGES);
  const hero = { id: "slide-1", type: "image", src: dead[0], title: "x" };
  assert.deepEqual(replaceDeadSlideMedia(hero), { ...hero, src: DEFAULT_IMAGES.hero });
  const video = replaceDeadSlideMedia({ type: "video", src: dead[2] });
  assert.equal(video.type, "image");
  assert.ok(video.src.startsWith("/images/defaults/"));
  const own = { type: "image", src: "/uploads/own.jpg" };
  assert.equal(replaceDeadSlideMedia(own), own);
  assert.equal(replaceDeadImage(dead[0]), DEFAULT_IMAGES.hero);
  assert.equal(replaceDeadImage(null), null);
  assert.equal(replaceDeadImage("/uploads/a.jpg"), "/uploads/a.jpg");
});
