import type { Metadata } from "next";
import { languageAlternates, localePath, type Locale } from "@/lib/i18n";

export const SITE_NAME = "PT AMP";
export const SITE_DESCRIPTION =
  "PT AMP — pengolah dan eksportir kayu manis (cinnamon / Cassia Vera) dari Sumatera Barat: grade A, grade B dan broken, diproses higienis untuk pasar ekspor.";
export const LOGO_PATH = "/logoAMP.png";
export const DEFAULT_TITLE = `${SITE_NAME} — Eksportir Kayu Manis (Cinnamon / Cassia Vera) Sumatera Barat`;

// openGraph/twitter di halaman menimpa milik layout seluruhnya (bukan merge) — field bersama di sini.
const OG_BASE = {
  type: "website" as const,
  siteName: SITE_NAME,
  locale: "id_ID",
  images: [{ url: LOGO_PATH, alt: SITE_NAME }],
};
const TWITTER_BASE = { card: "summary" as const, images: [LOGO_PATH] };

// Base URL situs: dipakai metadataBase & URL absolut di JSON-LD. Tanpa env: localhost.
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: DEFAULT_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { ...OG_BASE, title: DEFAULT_TITLE, description: SITE_DESCRIPTION },
  twitter: { ...TWITTER_BASE, title: DEFAULT_TITLE, description: SITE_DESCRIPTION },
};

// Metadata per halaman: title (tanpa "| PT AMP", ditambah di sini), description, canonical + hreflang, Open Graph & Twitter.
// Bukan title.template di layout: halaman admin sudah punya title lengkap sendiri.
// path = path halaman Indonesia; locale "en" → canonical/og ke /en/...
export function pageMetadata(
  pageTitle: string,
  description: string,
  path: string,
  locale: Locale = "id"
): Metadata {
  const title = `${pageTitle} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: languageAlternates(path, locale),
    openGraph: {
      ...OG_BASE,
      ...(locale === "en" ? { locale: "en_US" } : {}),
      title,
      description,
      url: localePath(locale, path),
    },
    twitter: { ...TWITTER_BASE, title, description },
  };
}

type ContactLike = {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
} | null;
type SocialLike = { url: string; isActive: boolean };
type ProductLike = { name: string; description?: string | null; image?: string | null };

const absolute = (base: string, url: string) =>
  /^https?:\/\//.test(url) ? url : `${base}${url.startsWith("/") ? "" : "/"}${url}`;

// Organization dari data CMS (ContactInfo, SocialMedia). Field kosong tidak ditulis — jangan mengarang.
export function organizationJsonLd(contact: ContactLike, socials: SocialLike[], base = siteUrl()) {
  const sameAs = socials.filter((s) => s.isActive && s.url && s.url !== "#").map((s) => s.url);
  const phone = contact?.phone?.trim() || contact?.whatsapp?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: base,
    logo: absolute(base, LOGO_PATH),
    description: SITE_DESCRIPTION,
    ...(contact?.email?.trim() ? { email: contact.email.trim() } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(contact?.address?.trim() ? { address: contact.address.trim() } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

// Daftar Product katalog publik (tanpa harga: tidak ada data harga di CMS).
export function productsJsonLd(products: ProductLike[], base = siteUrl()) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        ...(p.description ? { description: p.description } : {}),
        ...(p.image ? { image: absolute(base, p.image) } : {}),
        brand: { "@type": "Brand", name: SITE_NAME },
      },
    })),
  };
}

// JSON untuk <script type="application/ld+json">; "<" di-escape supaya teks CMS tidak bisa menutup tag script.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
