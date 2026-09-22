'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  customerCity?: string;
  productName: string;
  quantity: number;
  size?: string;
  itemPrice: number;
  deliveryCharge: number;
  totalPrice: number;
  status: string;
  orderSource: string;
  paymentMethod?: {
    name: string;
  };
  paymentStatus: string;
  deliveryChargePaid: boolean;
  createdAt: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchOrders();
  }, [session]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handlePaymentStatusUpdate = async (id: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, paymentStatus } : o));
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-plum-dark text-cream px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/admin/dashboard" className="font-serif text-lg md:text-2xl hover:text-gold">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-xs md:text-sm">{session.user?.email}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="font-serif text-2xl md:text-3xl text-plum-dark">Orders</h1>
          <Link
            href="/admin/orders/new"
            className="bg-plum text-cream px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors text-sm md:text-base"
          >
            Add Manual Order
          </Link>
        </div>

        <div className="bg-cream rounded-lg overflow-hidden border border-rose/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-rose-light">
                <tr>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Tracking</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Date</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Customer</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Phone</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Product</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Qty</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Total</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Source</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Del. Charge</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Del. Paid</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Pay Status</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Status</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 md:px-6 py-6 md:py-8 text-center text-foreground/60 text-sm md:text-base">
                      No orders yet. Add your first order!
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-t border-rose/20">
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs font-mono">{order.trackingCode}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">{order.customerName}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">{order.customerPhone}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">{order.productName}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">{order.quantity}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">PKR {order.totalPrice.toLocaleString()}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">{order.orderSource}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">PKR {order.deliveryCharge.toLocaleString()}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-semibold ${
                          order.deliveryChargePaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {order.deliveryChargePaid ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                          className="px-2 py-1 rounded border border-rose/30 text-[10px] md:text-xs"
                        >
                          <option value="Unpaid">Unpaid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="px-2 py-1 rounded border border-rose/30 text-[10px] md:text-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-[10px] md:text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
