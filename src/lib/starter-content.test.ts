import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { STARTER_ALBUMS, STARTER_POSTS } from "./starter-content";

test("starter posts have unique slugs and local images", () => {
  const slugs = STARTER_POSTS.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const p of STARTER_POSTS) {
    assert.match(p.slug, /^[a-z0-9-]+$/);
    assert.ok(existsSync(`public${p.image}`), p.image);
  }
});

test("starter posts are plain text (detail page renders text, not HTML)", () => {
  for (const p of STARTER_POSTS) assert.doesNotMatch(p.content, /<[a-z\/]/i, p.slug);
});

test("starter albums have items and local images", () => {
  for (const a of STARTER_ALBUMS) {
    assert.ok(a.items.length > 0, a.title);
    for (const src of [a.coverImage, ...a.items.map((i) => i.src)]) {
      assert.ok(existsSync(`public${src}`), src);
    }
  }
});

test("content seed creates starter posts and albums", () => {
  const seed = readFileSync("prisma/seeds/content-seed.ts", "utf8");
  assert.match(seed, /STARTER_POSTS/);
  assert.match(seed, /STARTER_ALBUMS/);
});
