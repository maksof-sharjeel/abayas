'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import OrderFormModal from '@/components/OrderFormModal';
import LoadingState from '@/components/LoadingState';
import OrderCostModal from '@/components/OrderCostModal';
import { productProfit } from '@/lib/profit';

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
  itemCost: number | null;
  deliveryCharge: number;
  totalPrice: number;
  status: string;
  orderSource: string;
  paymentMethod?: {
    name: string;
  };
  paymentStatus: string;
  deliveryChargePaid: boolean;
  deliveryChargeScreenshotUrl?: string | null;
  createdAt: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [costOrder, setCostOrder] = useState<Order | null>(null);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const inFlight = useRef(new Set<string>());
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Could not load orders. Please refresh and try again.');
      setOrders(await res.json());
    } catch (error) {
      console.error('Error fetching orders:', error);
      setNotice({ message: 'Could not load orders. Please refresh and try again.', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Could not load orders. Please refresh and try again.');
        setOrders(await res.json());
      } catch (error) {
        console.error('Error fetching orders:', error);
        setNotice({ message: 'Could not load orders. Please refresh and try again.', error: true });
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [session]);

  const saveOrder = async (id: string, changes: Partial<Pick<Order, 'status' | 'paymentStatus' | 'deliveryChargePaid' | 'itemCost'>>) => {
    if (inFlight.current.has(id)) throw new Error('Please wait for the current update to finish.');
    inFlight.current.add(id);
    setBusyIds(current => [...current, id]);
    setNotice(null);
    try {
      const response = await fetch('/api/orders/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update order. Please try again.');
      setOrders(current => current.map(order => order.id === id ? { ...order, ...data } : order));
      setNotice({ message: 'itemCost' in changes ? 'Purchase cost saved. Profit has been recalculated.' : 'Order updated successfully.', error: false });
    } finally { inFlight.current.delete(id); setBusyIds(current => current.filter(value => value !== id)); }
  };

  const updateOrder = (id: string, changes: Parameters<typeof saveOrder>[1]) => {
    void saveOrder(id, changes).catch(error => setNotice({ message: error.message, error: true }));
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
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-plum">Sales management</p><h1 className="mt-2 font-serif text-3xl md:text-4xl text-plum-dark">Orders</h1><p className="mt-2 text-sm text-foreground/60">Record vendor costs, verify payments and manage delivery.</p></div>
          <button
            type="button"
            onClick={() => setOrderModalOpen(true)}
            className="rounded-full bg-plum-dark px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-plum"
          >
            Add Manual Order
          </button>
        </div>

        {notice && <div role={notice.error ? 'alert' : 'status'} className={'mb-4 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm ' + (notice.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800')}><span>{notice.message}</span><button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)} className="px-2 text-lg">&times;</button></div>}
        <div className="bg-cream rounded-2xl overflow-hidden border border-plum-dark/10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-plum-dark/10 px-5 py-4"><span className="text-sm font-semibold text-plum-dark">All orders <span className="ml-2 rounded-full bg-rose-light px-2.5 py-1 text-xs">{orders.length}</span></span><span className="text-xs text-foreground/55">Purchase costs are per item</span></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px]">
              <thead className="bg-background/70 border-b border-plum-dark/10">
                <tr>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Tracking</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Customer</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Product</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Cost / item</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Selling / item</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Total</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Delivery payment</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Payment status</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Status</th>
                  <th className="px-3 md:px-4 py-3 text-left text-[10px] md:text-xs font-semibold text-plum-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 md:px-6 py-6 md:py-8 text-center text-foreground/60 text-sm md:text-base">
                      No orders yet. Add your first order!
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} aria-busy={busyIds.includes(order.id)} className="border-t border-plum-dark/8 align-top transition-colors hover:bg-background/50">
                      <td className="px-3 md:px-4 py-4 text-xs"><p className="whitespace-nowrap font-mono font-semibold text-plum-dark">{order.trackingCode}</p><p className="mt-2 text-foreground/55">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p><span className="mt-2 inline-block rounded-md bg-background px-2 py-1 text-[10px] text-foreground/60">{order.orderSource}</span></td>
                      <td className="px-3 md:px-4 py-4 text-xs"><p className="font-semibold text-plum-dark">{order.customerName}</p><p className="mt-2 whitespace-nowrap text-foreground/60">{order.customerPhone}</p>{order.customerCity && <p className="mt-1 text-foreground/45">{order.customerCity}</p>}</td>
                      <td className="px-3 md:px-4 py-4 text-xs"><p className="max-w-40 font-medium leading-5 text-plum-dark">{order.productName}</p><p className="mt-2 text-foreground/55">Qty {order.quantity}{order.size ? ' / Size ' + order.size : ''}</p></td>
                      <td className="px-3 md:px-4 py-4 text-xs"><p className={order.itemCost == null ? 'whitespace-nowrap font-medium text-amber-700' : 'whitespace-nowrap font-semibold tabular-nums text-plum-dark'}>{order.itemCost == null ? 'Cost pending' : 'PKR ' + order.itemCost.toLocaleString()}</p><button type="button" aria-label={'Edit purchase cost for ' + order.trackingCode} disabled={busyIds.includes(order.id)} onClick={() => setCostOrder(order)} className="mt-2 rounded-lg border border-plum-dark/15 px-2.5 py-1.5 text-xs font-semibold text-plum hover:bg-rose-light disabled:opacity-50">{order.itemCost == null ? '+ Add cost' : 'Edit cost'}</button>{order.itemCost != null && <p className={'mt-2 whitespace-nowrap text-[11px] ' + (order.itemPrice < order.itemCost ? 'text-red-700' : 'text-emerald-700')}>{order.status === 'Cancelled' ? 'Excluded from profit' : 'Gross profit: PKR ' + productProfit(order.itemPrice, order.itemCost, order.quantity).profit?.toLocaleString()}</p>}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">PKR {order.itemPrice.toLocaleString()}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-foreground text-[10px] md:text-xs">PKR {order.totalPrice.toLocaleString()}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <button type="button" aria-label={'Delivery paid for ' + order.trackingCode} aria-pressed={order.deliveryChargePaid} title={order.deliveryChargePaid ? 'Mark delivery payment as unverified' : 'Verify delivery payment'} disabled={busyIds.includes(order.id)} onClick={() => updateOrder(order.id, { deliveryChargePaid: !order.deliveryChargePaid })} className={'inline-flex min-w-32 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-plum/25 disabled:cursor-wait disabled:opacity-50 ' + (order.deliveryChargePaid ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100')}><span aria-hidden="true">{order.deliveryChargePaid ? '\u2713' : '\u25cb'}</span>{order.deliveryChargePaid ? 'Verified' : 'Unverified'}</button>
                        {order.deliveryChargeScreenshotUrl?.startsWith('https://res.cloudinary.com/') && <a className="mt-1 block text-plum underline" href={order.deliveryChargeScreenshotUrl} target="_blank" rel="noopener noreferrer">View proof</a>}
                        <p className="mt-2 text-xs tabular-nums text-foreground/55">PKR {order.deliveryCharge.toLocaleString()}</p>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <select
                          value={order.paymentStatus}
                          aria-label={'Payment status for ' + order.trackingCode}
                          disabled={busyIds.includes(order.id)}
                          onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value })}
                          className={'min-w-28 cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-plum/25 disabled:cursor-wait disabled:opacity-50 ' + (order.paymentStatus === 'Paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800')}
                        >
                          <option value="Unpaid">Unpaid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <select
                          value={order.status}
                          aria-label={'Order status for ' + order.trackingCode}
                          disabled={busyIds.includes(order.id)}
                          onChange={(e) => updateOrder(order.id, { status: e.target.value })}
                          className={'min-w-32 cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-plum/25 disabled:cursor-wait disabled:opacity-50 ' + (order.status === 'Delivered' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : order.status === 'Cancelled' ? 'border-stone-200 bg-stone-100 text-stone-600' : order.status === 'Shipped' ? 'border-violet-200 bg-violet-50 text-violet-800' : order.status === 'Confirmed' ? 'border-sky-200 bg-sky-50 text-sky-800' : 'border-amber-200 bg-amber-50 text-amber-800')}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        {busyIds.includes(order.id) && <p role="status" className="mt-2 text-xs text-plum">Saving...</p>}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <button
                          onClick={() => handleDelete(order.id)}
                          disabled={busyIds.includes(order.id)}
                          className="rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-xs disabled:opacity-50"
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
          <p className="border-t border-plum-dark/10 px-5 py-3 text-xs text-foreground/50">Gross profit excludes delivery. Only delivered orders with a recorded cost contribute to dashboard profit.</p>
        </div>
      </div>
      {orderModalOpen && <OrderFormModal onClose={() => setOrderModalOpen(false)} onSaved={fetchOrders} />}
      {costOrder && <OrderCostModal key={costOrder.id} order={costOrder} onClose={() => setCostOrder(null)} onSave={cost => saveOrder(costOrder.id, { itemCost: cost })} />}
    </AdminLayout>
  );
}
