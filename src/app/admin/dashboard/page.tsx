'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-plum-dark text-cream px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-serif text-2xl">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user?.email}</span>
            <button
              onClick={() => router.push('/')}
              className="text-sm hover:text-gold transition-colors"
            >
              View Site
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/products"
            className="bg-cream rounded-lg p-6 hover:shadow-lg transition-shadow border border-rose/20"
          >
            <h2 className="font-serif text-2xl text-plum-dark mb-2">Products</h2>
            <p className="text-foreground/70">Manage your product inventory</p>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-cream rounded-lg p-6 hover:shadow-lg transition-shadow border border-rose/20"
          >
            <h2 className="font-serif text-2xl text-plum-dark mb-2">Categories</h2>
            <p className="text-foreground/70">Organize product categories</p>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-cream rounded-lg p-6 hover:shadow-lg transition-shadow border border-rose/20"
          >
            <h2 className="font-serif text-2xl text-plum-dark mb-2">Settings</h2>
            <p className="text-foreground/70">Configure store settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
