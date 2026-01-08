"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  id: number;
  type: "image" | "video";
  src: string;
  title: string;
  description: string;
  buttons?: {
    text: string;
    href: string;
    primary?: boolean;
  }[];
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
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
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
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
            <div className="flex flex-col sm:flex-row gap-4">
              {slides[current].buttons?.map((btn, idx) => (
                <a
                  key={idx}
                  href={btn.href}
                  className={`inline-flex justify-center items-center rounded-lg px-6 py-3 font-medium transition-all ${
                    btn.primary
                      ? "text-white shadow-lg shadow-red-200 hover:-translate-y-0.5"
                      : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                  }`}
                  style={btn.primary ? { backgroundColor: "var(--brand)" } : {}}
                >
                  {btn.text}
                </a>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div
              key={`${slides[current]?.id ?? current}-visual`}
              className="relative rounded-2xl h-64 md:h-96 w-full bg-zinc-100 shadow-inner overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95 duration-500"
            >
              {slides[current].type === "video" ? (
                <video
                  ref={videoRef}
                  src={slides[current].src}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${slides[current].src}')` }}
                />
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
      
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-md hover:bg-white text-zinc-700 transition-colors z-20 md:hidden"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-md hover:bg-white text-zinc-700 transition-colors z-20 md:hidden"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
