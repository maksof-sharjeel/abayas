'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import OrderFormModal from '@/components/OrderFormModal';
import LoadingState from '@/components/LoadingState';

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
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) setOrders(await res.json());
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) setOrders(await res.json());
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
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
    return <AdminLayout><LoadingState label="Loading orders" fullScreen={false} /></AdminLayout>;
  }

  if (!session) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="font-serif text-2xl md:text-3xl text-plum-dark">Orders</h1>
          <button
            type="button"
            onClick={() => setOrderModalOpen(true)}
            className="rounded-full bg-plum-dark px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-plum"
          >
            Add Manual Order
          </button>
        </div>

        <div className="bg-cream rounded-lg overflow-hidden border border-rose/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-250">
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
      {orderModalOpen && <OrderFormModal onClose={() => setOrderModalOpen(false)} onSaved={fetchOrders} />}
    </AdminLayout>
  );
}
