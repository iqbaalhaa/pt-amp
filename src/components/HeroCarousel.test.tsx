import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { HeroCarousel, type HeroSlide } from "./HeroCarousel";

const slide = (id: number): HeroSlide => ({
  id,
  type: "image",
  src: "/hero.jpg",
  title: `Judul ${id}`,
  description: "Deskripsi",
  buttons: [{ text: "Minta Sampel", href: "#contact", primary: true }],
});

test("mobile: ruang bawah untuk indikator, panah sejajar indikator (bukan tengah)", () => {
  const html = renderToStaticMarkup(<HeroCarousel slides={[slide(1), slide(2)]} />);
  assert.match(html, /pb-24 md:pt-0 md:pb-0/);
  for (const label of ["Previous slide", "Next slide"]) {
    const btn = html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? "";
    assert.match(btn, /bottom-\[18px\]/);
    assert.match(btn, /md:hidden/);
    assert.doesNotMatch(btn, /top-1\/2/);
  }
});

test("tombol hero tetap: teks & link #contact", () => {
  const html = renderToStaticMarkup(<HeroCarousel slides={[slide(1)]} />);
  assert.match(html, /<a href="#contact"[^>]*>Minta Sampel<\/a>/);
});
