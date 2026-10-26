"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_HERO } from "@/lib/hero-default";
import { HeroButtons } from "./HeroButtons";

export interface HeroSlide {
  id: number | string;
  type: "image" | "video";
  src: string;
  title: string;
  description: string;
  buttons?: {
    text: string;
    href: string;
    primary?: boolean;
    isPrimary?: boolean;
  }[];
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  if (slides.length === 0) {
    return (
      <div className="relative overflow-hidden min-h-[600px] flex items-center bg-gradient-to-b from-zinc-50 via-white to-zinc-50 border-b border-zinc-200">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-zinc-900">
                <span className="bg-gradient-to-r from-[var(--brand)] to-orange-500 bg-clip-text text-transparent">
                  {DEFAULT_HERO.title}
                </span>
              </h1>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed max-w-lg">
                {DEFAULT_HERO.description}
              </p>
              <HeroButtons buttons={DEFAULT_HERO.buttons} />
            </div>
            <div className="order-1 md:order-2">
              <div className="relative rounded-2xl h-64 md:h-96 w-full bg-zinc-100 shadow-inner overflow-hidden border border-zinc-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const next = () => {
    setCurrent((curr) => (curr + 1) % slides.length);
  };

  const prev = () => {
    setCurrent((curr) => (curr - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (slides[current].type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [current, slides]);

  return (
    <div className="relative overflow-hidden min-h-[600px] flex items-center bg-gradient-to-b from-zinc-50 via-white to-zinc-50 border-b border-zinc-200">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>
      {/* Mobile: ruang bawah untuk indikator & panah agar tidak menimpa tombol. */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 pt-10 pb-24 md:pt-0 md:pb-0">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div
            key={slides[current]?.id ?? current}
            className="order-2 md:order-1 animate-in fade-in slide-in-from-left-4 duration-500"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-zinc-900">
              <span className="bg-gradient-to-r from-[var(--brand)] to-orange-500 bg-clip-text text-transparent">
                {slides[current].title}
              </span>
            </h1>
            <p className="text-lg text-zinc-600 mb-8 leading-relaxed max-w-lg">
              {slides[current].description}
            </p>
            <HeroButtons buttons={slides[current].buttons} />
          </div>

          <div className="order-1 md:order-2">
            <div
              key={`${slides[current]?.id ?? current}-visual`}
              className="relative rounded-2xl h-64 md:h-96 w-full bg-zinc-100 shadow-inner overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95 duration-500"
            >
              {slides[current].type === "video" ? (
                <div className="relative w-full h-full bg-zinc-200">
                  <video
                    ref={videoRef}
                    src={slides[current].src}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.querySelector(".video-fallback")?.classList.remove("hidden");
                    }}
                  />
                  <div className="video-fallback hidden absolute inset-0 flex items-center justify-center text-zinc-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full bg-zinc-200">
                  <img
                    src={slides[current].src}
                    alt={slides[current].title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.querySelector(".image-fallback")?.classList.remove("hidden");
                    }}
                  />
                  <div className="image-fallback hidden absolute inset-0 flex items-center justify-center text-zinc-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === idx ? "bg-[var(--brand)] w-8" : "bg-zinc-300 hover:bg-zinc-400"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Panah hanya di mobile, sejajar indikator supaya tidak menutup judul. */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 bottom-[18px] p-2 rounded-full bg-white/80 shadow-md hover:bg-white text-zinc-700 transition-colors z-20 md:hidden"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 bottom-[18px] p-2 rounded-full bg-white/80 shadow-md hover:bg-white text-zinc-700 transition-colors z-20 md:hidden"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
