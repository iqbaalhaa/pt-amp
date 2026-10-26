// Run: pnpm exec tsx --test src/components/pages/home/TrustSection.test.tsx
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { TrustSection } from "./TrustSection";

const stat = { id: "s1", title: "±10", description: "Tenaga kerja terampil", icon: null };
const cert = { id: "c1", title: "NIB", description: "No. 123", icon: null };

test("renders nothing when CMS is empty", () => {
  assert.equal(renderToStaticMarkup(<TrustSection stats={[]} certifications={[]} />), "");
});

test("renders stats only, without certification heading", () => {
  const html = renderToStaticMarkup(<TrustSection stats={[stat]} certifications={[]} />);
  assert.match(html, /±10/);
  assert.match(html, /Tenaga kerja terampil/);
  assert.doesNotMatch(html, /Sertifikasi/);
});

test("renders certifications when present", () => {
  const html = renderToStaticMarkup(<TrustSection stats={[]} certifications={[cert]} />);
  assert.match(html, /Sertifikasi &amp; Legalitas/);
  assert.match(html, /NIB/);
  assert.match(html, /No\. 123/);
});
