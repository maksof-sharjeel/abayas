'use client';

import { useEffect, useMemo, useState } from 'react';

interface Product { id: string; productCode?: string; name: string; price: number; costPrice?: number | null; }
interface DeliverySetting { id: string | null; deliveryCharge: number; }
interface PaymentMethod { id: string; name: string; isActive: boolean; }

interface OrderFormModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function OrderFormModal({ onClose, onSaved }: OrderFormModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerAddress: '', customerCity: '', productId: '', quantity: 1, size: '', orderSource: 'Phone', paymentMethodId: '', deliveryChargePaid: false, notes: '' });

  useEffect(() => {
    Promise.all([fetch('/api/products'), fetch('/api/delivery-zones'), fetch('/api/payment-methods')]).then(async ([productsResponse, deliveryResponse, methodsResponse]) => {
      if (productsResponse.ok) setProducts(await productsResponse.json());
      if (deliveryResponse.ok) setDeliveryCharge(((await deliveryResponse.json()) as DeliverySetting).deliveryCharge || 0);
      if (methodsResponse.ok) setMethods((await methodsResponse.json()).filter((method: PaymentMethod) => method.isActive));
    }).catch((error) => console.error('Error loading order options:', error));
  }, []);

  const selectedProduct = products.find((product) => product.id === form.productId);
  const total = useMemo(() => (selectedProduct?.price || 0) * form.quantity + deliveryCharge, [selectedProduct, form.quantity, deliveryCharge]);
  const update = (name: string, value: string | number | boolean) => setForm((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProduct) return alert('Please select a product');
    setSaving(true);
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, productName: selectedProduct.name, itemPrice: selectedProduct.price, deliveryCharge, totalPrice: total }) });
      if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Unable to create order'); }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error instanceof Error ? error.message : 'Failed to record order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-plum-dark/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-plum-dark/10 bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-plum-dark/10 bg-cream px-5 py-4 md:px-7"><div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-plum">Sales</p><h2 id="order-modal-title" className="mt-1 font-serif text-2xl text-plum-dark">Add manual order</h2></div><button type="button" onClick={onClose} aria-label="Close order form" className="text-2xl leading-none text-foreground/50 hover:text-plum-dark">×</button></div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5 md:p-7">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><label className="text-sm font-medium text-foreground">Customer name<input required value={form.customerName} onChange={(e) => update('customerName', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label><label className="text-sm font-medium text-foreground">Phone number<input required type="tel" value={form.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label></div>
          <label className="block text-sm font-medium text-foreground">Address<textarea rows={2} value={form.customerAddress} onChange={(e) => update('customerAddress', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><label className="text-sm font-medium text-foreground">City<input required value={form.customerCity} onChange={(e) => update('customerCity', e.target.value)} placeholder="e.g. Lahore" className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label><label className="text-sm font-medium text-foreground">Product<select required value={form.productId} onChange={(e) => update('productId', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum"><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.productCode ? `${product.productCode} · ` : ''}{product.name}</option>)}</select></label></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><label className="text-sm font-medium text-foreground">Size<input value={form.size} onChange={(e) => update('size', e.target.value)} placeholder="54" className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label><label className="text-sm font-medium text-foreground">Quantity<input type="number" min="1" value={form.quantity} onChange={(e) => update('quantity', Number(e.target.value))} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label><label className="text-sm font-medium text-foreground">Source<select value={form.orderSource} onChange={(e) => update('orderSource', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum"><option>Phone</option><option>WhatsApp</option><option>Walk-in</option></select></label></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><label className="text-sm font-medium text-foreground">Payment method<select value={form.paymentMethodId} onChange={(e) => update('paymentMethodId', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum"><option value="">Select method</option>{methods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}</select></label><div className="flex items-center gap-3 pt-7 text-sm font-medium text-foreground"><input type="checkbox" checked={form.deliveryChargePaid} onChange={(e) => update('deliveryChargePaid', e.target.checked)} className="h-4 w-4 accent-plum" /> Delivery charge paid</div></div>
          <div className="grid grid-cols-1 gap-3 rounded-lg bg-rose-light p-4 text-sm sm:grid-cols-3"><div>Cost / item<p className="mt-1 font-semibold">{selectedProduct?.costPrice == null ? 'Not set' : 'PKR ' + selectedProduct.costPrice.toLocaleString()}</p></div><div>Selling / item<p className="mt-1 font-semibold">{selectedProduct ? 'PKR ' + selectedProduct.price.toLocaleString() : 'Select a product'}</p></div><div>Delivery charge<p className="mt-1 font-semibold">PKR {deliveryCharge.toLocaleString()}</p></div></div>
          <label className="block text-sm font-medium text-foreground">Notes<textarea rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label>
          <div className="flex items-center justify-between border-t border-plum-dark/10 pt-5"><div><p className="text-xs text-foreground/55">Order total</p><p className="text-xl font-semibold text-plum-dark">PKR {total.toLocaleString()}</p></div><div className="flex gap-3"><button type="button" onClick={onClose} className="rounded-full border border-plum-dark/20 px-5 py-3 text-sm font-semibold text-plum-dark hover:bg-rose-light">Cancel</button><button type="submit" disabled={saving} className="rounded-full bg-plum-dark px-5 py-3 text-sm font-semibold text-cream hover:bg-plum disabled:opacity-50">{saving ? 'Saving...' : 'Save order'}</button></div></div>
        </form>
      </div>
    </div>
  );
}
