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
      <nav className="bg-plum-dark text-cream px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-serif text-xl md:text-2xl">Admin Dashboard</h1>
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-xs md:text-sm">{session.user?.email}</span>
            <button
              onClick={() => router.push('/')}
              className="text-xs md:text-sm hover:text-gold transition-colors"
            >
              View Site
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h2 className="font-serif text-2xl md:text-3xl text-plum-dark mb-6 md:mb-8">Welcome, Admin!</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Link
            href="/admin/products"
            className="group bg-gradient-to-br from-cream to-rose-light rounded-lg md:rounded-xl p-6 md:p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-rose/30"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-plum/20 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:bg-plum/30 transition-colors">
              <span className="text-2xl md:text-3xl">👗</span>
            </div>
            <h2 className="font-serif text-xl md:text-2xl text-plum-dark mb-2 group-hover:text-plum transition-colors">Products</h2>
            <p className="text-foreground/70 text-sm md:text-base">Manage your product inventory</p>
          </Link>

          <Link
            href="/admin/categories"
            className="group bg-gradient-to-br from-cream to-rose-light rounded-lg md:rounded-xl p-6 md:p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-rose/30"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-plum/20 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:bg-plum/30 transition-colors">
              <span className="text-2xl md:text-3xl">📁</span>
            </div>
            <h2 className="font-serif text-xl md:text-2xl text-plum-dark mb-2 group-hover:text-plum transition-colors">Categories</h2>
            <p className="text-foreground/70 text-sm md:text-base">Organize product categories</p>
          </Link>

          <Link
            href="/admin/settings"
            className="group bg-gradient-to-br from-cream to-rose-light rounded-lg md:rounded-xl p-6 md:p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-rose/30"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-plum/20 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:bg-plum/30 transition-colors">
              <span className="text-2xl md:text-3xl">⚙️</span>
            </div>
            <h2 className="font-serif text-xl md:text-2xl text-plum-dark mb-2 group-hover:text-plum transition-colors">Settings</h2>
            <p className="text-foreground/70 text-sm md:text-base">Configure store settings</p>
          </Link>
        </div>

        <div className="mt-6 md:mt-8">
          <h3 className="font-serif text-xl md:text-2xl text-plum-dark mb-4 md:mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <Link
              href="/admin/orders/new"
              className="group bg-gradient-to-br from-green-50 to-green-100 rounded-lg md:rounded-xl p-6 md:p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-green-300"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-200 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:bg-green-300 transition-colors">
                <span className="text-2xl md:text-3xl">📝</span>
              </div>
              <h2 className="font-serif text-xl md:text-2xl text-green-800 mb-2 group-hover:text-green-900 transition-colors">Add Manual Order</h2>
              <p className="text-foreground/70 text-sm md:text-base">Record order from phone call</p>
            </Link>

            <Link
              href="/admin/orders"
              className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-xl p-6 md:p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-blue-300"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-200 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:bg-blue-300 transition-colors">
                <span className="text-2xl md:text-3xl">📋</span>
              </div>
              <h2 className="font-serif text-xl md:text-2xl text-blue-800 mb-2 group-hover:text-blue-900 transition-colors">View Orders</h2>
              <p className="text-foreground/70 text-sm md:text-base">See all recorded orders</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
