import type { HeroSlide } from "./HeroCarousel";

export function HeroButtons({ buttons }: { buttons?: HeroSlide["buttons"] }) {
  if (!buttons?.length) return null;
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {buttons.map((btn, idx) => {
        const primary = btn.primary || btn.isPrimary;
        return (
          <a
            key={idx}
            href={btn.href}
            className={`inline-flex justify-center items-center rounded-lg px-6 py-3 font-medium transition-all ${
              primary
                ? "text-white shadow-lg shadow-red-200 hover:-translate-y-0.5"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            }`}
            style={primary ? { backgroundColor: "var(--brand)" } : {}}
          >
            {btn.text}
          </a>
        );
      })}
    </div>
  );
}
