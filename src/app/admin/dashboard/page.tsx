'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stockStatus: string;
  images?: string[];
}

interface Order {
  id: string;
  trackingCode: string;
  customerName: string;
  productName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-gold-light text-plum-dark',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-rose-light text-plum',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const statusBarStyles: Record<string, string> = {
  Pending: 'bg-gold',
  Confirmed: 'bg-blue-500',
  Shipped: 'bg-plum',
  Delivered: 'bg-green-500',
  Cancelled: 'bg-red-400',
};

function getMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [productsRes, ordersRes] = await Promise.all([fetch('/api/products'), fetch('/api/orders')]);
        if (productsRes.ok) setProducts(await productsRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const analytics = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== 'Cancelled');
    const revenue = activeOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const now = new Date();
    const monthPoints = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthOrders = activeOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === date.getFullYear() && orderDate.getMonth() === date.getMonth();
      });
      return {
        label: getMonthLabel(date),
        revenue: monthOrders.reduce((sum, order) => sum + order.totalPrice, 0),
        orders: monthOrders.length,
      };
    });
    const maxRevenue = Math.max(...monthPoints.map((point) => point.revenue), 1);
    const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => ({
      status,
      count: orders.filter((order) => order.status === status).length,
    }));
    const categoryCounts = products.reduce<Record<string, number>>((counts, product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
      return counts;
    }, {});

    return { activeOrders, revenue, monthPoints, maxRevenue, statuses, categoryCounts };
  }, [orders, products]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-375 p-5 md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-plum">Business overview</p>
            <h1 className="mt-2 font-serif text-4xl text-plum-dark md:text-5xl">Dashboard</h1>
            <p className="mt-3 text-sm text-foreground/60">Track your boutique performance and daily operations.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/55">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Live data
            <Link href="/admin/orders" className="rounded-full bg-plum-dark px-4 py-2.5 font-semibold text-cream transition-colors hover:bg-plum">View orders</Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <div className="border border-plum-dark/10 bg-cream p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/50">Total revenue</p><p className="mt-3 text-2xl font-semibold text-plum-dark">{loading ? '—' : `PKR ${analytics.revenue.toLocaleString()}`}</p><p className="mt-2 text-xs text-green-700">All active orders</p></div>
          <div className="border border-plum-dark/10 bg-cream p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/50">Total orders</p><p className="mt-3 text-3xl font-semibold text-plum-dark">{loading ? '—' : orders.length}</p><p className="mt-2 text-xs text-foreground/55">{analytics.activeOrders.length} active orders</p></div>
          <div className="border border-plum-dark/10 bg-cream p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/50">Pending orders</p><p className="mt-3 text-3xl font-semibold text-plum-dark">{loading ? '—' : analytics.statuses.find((item) => item.status === 'Pending')?.count || 0}</p><p className="mt-2 text-xs text-gold">Needs attention</p></div>
          <div className="border border-plum-dark/10 bg-cream p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/50">Products</p><p className="mt-3 text-3xl font-semibold text-plum-dark">{loading ? '—' : products.length}</p><p className="mt-2 text-xs text-foreground/55">{products.filter((product) => product.stockStatus === 'In Stock').length} in stock</p></div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <section className="border border-plum-dark/10 bg-cream p-5 md:p-6">
            <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-plum">Performance</p><h2 className="mt-1 font-serif text-2xl text-plum-dark">Revenue overview</h2></div><span className="text-xs text-foreground/50">Last 6 months</span></div>
            <div className="mt-8 flex h-56 items-end gap-3 border-b border-l border-plum-dark/10 px-2 pb-0 sm:gap-6">
              {analytics.monthPoints.map((point) => <div key={point.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="group relative w-full max-w-12 rounded-t-sm bg-plum transition-colors hover:bg-plum-dark" style={{ height: `${Math.max((point.revenue / analytics.maxRevenue) * 88, point.revenue ? 8 : 2)}%` }}><span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap bg-plum-dark px-2 py-1 text-[10px] text-cream group-hover:block">PKR {point.revenue.toLocaleString()}</span></div><span className="text-[11px] text-foreground/55">{point.label}</span></div>)}
            </div>
            <div className="mt-4 flex justify-between text-xs text-foreground/45"><span>Revenue generated from completed active orders</span><span>{analytics.monthPoints.reduce((sum, point) => sum + point.orders, 0)} orders in period</span></div>
          </section>

          <section className="border border-plum-dark/10 bg-cream p-5 md:p-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-plum">Order health</p><h2 className="mt-1 font-serif text-2xl text-plum-dark">Order status</h2></div><div className="mt-8 space-y-4">{analytics.statuses.map((item) => <div key={item.status}><div className="mb-1 flex justify-between text-xs"><span className="text-foreground/70">{item.status}</span><span className="font-semibold text-plum-dark">{item.count}</span></div><div className="h-2 bg-rose-light"><div className={`h-full ${statusBarStyles[item.status]}`} style={{ width: `${orders.length ? (item.count / orders.length) * 100 : 0}%` }} /></div></div>)}</div><Link href="/admin/orders" className="mt-8 block text-sm font-semibold text-plum hover:underline">Manage all orders →</Link></section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="border border-plum-dark/10 bg-cream"><div className="flex items-center justify-between border-b border-plum-dark/10 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-plum">Live queue</p><h2 className="mt-1 font-serif text-2xl text-plum-dark">Recent orders</h2></div><Link href="/admin/orders" className="text-sm font-semibold text-plum hover:underline">View all →</Link></div><div className="divide-y divide-plum-dark/10">{orders.length === 0 ? <p className="p-8 text-sm text-foreground/55">No orders yet. New orders will appear here.</p> : orders.slice(0, 6).map((order) => <div key={order.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-plum-dark">{order.customerName}</p><p className="mt-1 truncate text-xs text-foreground/50">{order.trackingCode} · {order.productName}</p></div><div className="text-right"><p className="text-sm font-semibold text-plum-dark">PKR {order.totalPrice.toLocaleString()}</p><span className={`mt-1 inline-block px-2 py-1 text-[10px] font-semibold ${statusStyles[order.status] || 'bg-rose-light text-plum'}`}>{order.status}</span></div></div>)}</div></section>

          <section className="border border-plum-dark/10 bg-cream p-5 md:p-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-plum">Catalog mix</p><h2 className="mt-1 font-serif text-2xl text-plum-dark">Products by category</h2></div><div className="mt-6 space-y-4">{Object.entries(analytics.categoryCounts).length === 0 ? <p className="text-sm text-foreground/55">No products available.</p> : Object.entries(analytics.categoryCounts).map(([category, count]) => <div key={category} className="flex items-center justify-between border-b border-plum-dark/10 pb-3"><span className="text-sm text-foreground/70">{category}</span><span className="font-semibold text-plum-dark">{count}</span></div>)}</div><Link href="/admin/products" className="mt-6 block text-sm font-semibold text-plum hover:underline">View inventory →</Link></section>
        </div>
      </div>
    </AdminLayout>
  );
}
