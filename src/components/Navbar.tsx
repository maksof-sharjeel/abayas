'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-cream border-b border-rose/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link href="/" className="font-serif text-xl md:text-2xl text-plum-dark font-bold">
            SK Hand Embroidery
          </Link>
          
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            <Link href="/" className="text-sm md:text-base text-foreground hover:text-plum transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-sm md:text-base text-foreground hover:text-plum transition-colors">
              Shop
            </Link>
            <Link href="/contact" className="text-sm md:text-base text-foreground hover:text-plum transition-colors">
              Contact
            </Link>
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground p-1"
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
        <div className="md:hidden bg-cream border-t border-rose/20">
          <div className="px-4 py-3 space-y-2">
            <Link href="/" className="block py-2 text-sm md:text-base text-foreground hover:text-plum" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/shop" className="block py-2 text-sm md:text-base text-foreground hover:text-plum" onClick={() => setIsOpen(false)}>
              Shop
            </Link>
            <Link href="/contact" className="block py-2 text-sm md:text-base text-foreground hover:text-plum" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
