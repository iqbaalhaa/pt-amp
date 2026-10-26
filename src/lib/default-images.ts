// Local default images (public/images/defaults) for seed data and empty-CMS fallbacks.
// Old seeded Unsplash/Pexels URLs return 404 → shown as grey boxes.
export const DEFAULT_IMAGES = {
  hero: "/images/defaults/cinnamon-hero.svg",
  export: "/images/defaults/cinnamon-export.svg",
  gradeA: "/images/defaults/cinnamon-grade-a.svg",
  gradeB: "/images/defaults/cinnamon-grade-b.svg",
  broken: "/images/defaults/cinnamon-broken.svg",
} as const;

// Dead seed URLs → local replacement; seed upgrades rows still holding them.
export const DEAD_SEED_IMAGES: Record<string, string> = {
  "https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop":
    DEFAULT_IMAGES.hero,
  "https://images.unsplash.com/photo-1615485925763-867862f80933?q=80&w=2074&auto=format&fit=crop":
    DEFAULT_IMAGES.export,
  "https://videos.pexels.com/video-files/4440816/4440816-hd_1920_1080_30fps.mp4":
    DEFAULT_IMAGES.gradeA,
};
