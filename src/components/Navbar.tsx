'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-plum-dark/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-19 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 text-plum-dark">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold text-sm font-semibold tracking-[0.18em] text-gold">SK</span>
            <span>
              <span className="block font-serif text-lg font-semibold leading-none md:text-xl">SK Hand Embroidery</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.28em] text-plum/70">Lahore • Since 2018</span>
            </span>
          </Link>
          
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-foreground/75 transition-colors hover:text-plum">
              Home
            </Link>
            <Link href="/shop" className="text-sm font-medium text-foreground/75 transition-colors hover:text-plum">
              Shop
            </Link>
            <Link href="/contact" className="text-sm font-medium text-foreground/75 transition-colors hover:text-plum">
              Contact
            </Link>
            <Link href="/shop" className="rounded-full bg-plum-dark px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-plum">
              Explore collection
            </Link>
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="border-t border-plum-dark/10 bg-cream md:hidden">
          <div className="space-y-2 px-5 py-4">
            <Link href="/" className="block py-2 text-sm text-foreground hover:text-plum" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/shop" className="block py-2 text-sm text-foreground hover:text-plum" onClick={() => setIsOpen(false)}>
              Shop
            </Link>
            <Link href="/contact" className="block py-2 text-sm text-foreground hover:text-plum" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
