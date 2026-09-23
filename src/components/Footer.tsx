'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SocialSettings {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

export default function Footer() {
  const [socials, setSocials] = useState<SocialSettings>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data) setSocials(data);
      })
      .catch(() => undefined);
  }, []);

  const socialLinks = [
    { label: 'Instagram', href: socials.instagram, icon: '◎' },
    { label: 'Facebook', href: socials.facebook, icon: 'f' },
    { label: 'TikTok', href: socials.tiktok, icon: '♪' },
  ].filter((social): social is { label: string; href: string; icon: string } => Boolean(social.href));

  return (
    <footer className="bg-plum-dark py-12 text-cream md:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          <div>
            <h3 className="font-serif text-2xl">SK Hand Embroidery</h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-cream/65">
              Exquisite hand-embroidered abayas and modest wear crafted with love and care.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Explore</h4>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-gold transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Visit the studio</h4>
            <p className="mt-4 text-sm leading-7 text-cream/75">
              WhatsApp: 0319 8271315<br />
              Lahore, Pakistan<br />
              Mon–Sat, 11:00–19:00
            </p>
          </div>

          {socialLinks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Follow the studio</h4>
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group flex items-center gap-2 border border-cream/20 px-3 py-2 text-xs text-cream/75 transition-colors hover:border-gold hover:text-gold"
                  >
                    <span className="font-semibold text-gold">{social.icon}</span>
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-12 border-t border-cream/15 pt-6 text-center text-xs text-cream/45 md:mt-16">
          <p>&copy; {new Date().getFullYear()} SK Hand Embroidery Boutique. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
