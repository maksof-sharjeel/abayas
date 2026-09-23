'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

const menuSections = [
  {
    label: 'Overview',
    items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: '▦' }],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: '◇' },
      { href: '/admin/categories', label: 'Categories', icon: '▤' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: '☷' },
      { href: '/admin/inquiries', label: 'Inquiries', icon: '✉' },
    ],
  },
  {
    label: 'Store Setup',
    items: [
      { href: '/admin/delivery-zones', label: 'Delivery Zones', icon: '⌖' },
      { href: '/admin/payment-methods', label: 'Payment Methods', icon: '▣' },
      { href: '/admin/settings', label: 'Settings', icon: '⚙' },
    ],
  },
];

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-plum-dark/50 lg:hidden"
        />
      )}
      <aside className={`fixed left-0 top-0 z-50 flex min-h-screen w-72 flex-col bg-plum-dark shadow-2xl transition-transform duration-300 lg:w-64 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-cream/10 px-6 py-5">
          <Link href="/admin/dashboard" onClick={onClose} className="font-serif text-2xl font-bold text-cream">
            SK Admin
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin menu"
            className="text-2xl leading-none text-cream/70 hover:text-cream lg:hidden"
          >
            ×
          </button>
        </div>

        <div className="border-b border-cream/10 px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Boutique management</p>
          <p className="mt-1 text-sm text-cream/60">SK Hand Embroidery</p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {menuSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/40">{section.label}</p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                        isActive
                          ? 'bg-gold font-semibold text-plum-dark shadow-lg shadow-black/10'
                          : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-current text-base">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-cream/10 p-4">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-cream/70 transition-all hover:bg-cream/10 hover:text-cream"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-current">↗</span>
            View storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-cream/70 transition-all hover:bg-red-600 hover:text-cream"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-current">⇥</span>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
