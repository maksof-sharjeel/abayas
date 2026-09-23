'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    src: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85',
    alt: 'Woman wearing an elegant black abaya',
    title: 'Noor / 2026',
  },
  {
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
    alt: 'Elegant modest fashion in a warm studio',
    title: 'Ayla / 2026',
  },
  {
    src: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
    alt: 'Rust-toned fashion detail',
    title: 'Zoya / 2026',
  },
  {
    src: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Charcoal modest fashion silhouette',
    title: 'Raya / 2026',
  },
  {
    src: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85',
    alt: 'Premium flowing fabric detail',
    title: 'Sahar / 2026',
  },
];

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
      setIsImageLoaded(false);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const activeSlide = slides[activeIndex];

  return (
    <div
      className="relative min-h-105 overflow-hidden lg:min-h-155"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 bg-plum-dark/20" />
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          onLoad={() => index === activeIndex && setIsImageLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
            index === activeIndex
              ? `scale-105 opacity-100 ${isImageLoaded ? 'motion-image' : ''}`
              : 'scale-100 opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-r from-plum-dark/20 via-transparent to-plum-dark/15" />
      <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-4">
        <div className="motion-drift border border-cream/40 bg-plum-dark/45 px-4 py-3 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gold">The new edit</p>
          <p className="mt-1 font-serif text-xl text-cream">{activeSlide.title}</p>
        </div>
        <div className="flex gap-1.5" aria-label="Hero slides">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Show ${slide.title}`}
              onClick={() => { setActiveIndex(index); setIsImageLoaded(false); }}
              className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-gold' : 'w-1.5 bg-cream/60 hover:bg-cream'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
