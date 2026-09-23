'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import LoadingState from './LoadingState';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingState label="Opening admin panel" />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-rose/20 bg-cream/95 px-4 shadow-sm backdrop-blur md:px-8 lg:justify-end">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-plum/20 text-xl text-plum-dark transition-colors hover:bg-rose-light lg:hidden"
          >
            <span aria-hidden="true">☰</span>
          </button>
          <span className="text-sm font-medium text-plum-dark/70">Admin panel</span>
        </header>
        <div>{children}</div>
      </main>
    </div>
  );
}
