'use client';

import { useEffect, useRef, useState } from 'react';
import { productProfit, validMoney } from '@/lib/profit';

interface CostOrder {
  id: string;
  trackingCode: string;
  productName: string;
  itemCost: number | null;
  itemPrice: number;
  quantity: number;
}

export default function OrderCostModal({ order, onClose, onSave }: {
  order: CostOrder;
  onClose: () => void;
  onSave: (cost: number | null) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(order.itemCost == null ? '' : String(order.itemCost));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const cost = value.trim() === '' ? null : Number(value);
  const valid = cost === null || validMoney(cost);
  const preview = valid ? productProfit(order.itemPrice, cost, order.quantity) : null;

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError('');
    try {
      await onSave(cost);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save purchase cost.');
      setSaving(false);
    }
  }

  return (
    <dialog ref={dialog} aria-labelledby="order-cost-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-plum-dark/10 bg-cream p-0 text-foreground shadow-2xl backdrop:bg-plum-dark/50 backdrop:backdrop-blur-sm">
      <form onSubmit={submit} className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-plum">{order.trackingCode}</p><h2 id="order-cost-title" className="mt-2 font-serif text-2xl text-plum-dark">Vendor purchase cost</h2></div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close purchase cost" className="rounded-full px-3 py-1 text-xl text-foreground/60 hover:bg-rose-light disabled:opacity-50">&times;</button>
        </div>
        <p className="mt-3 text-sm text-foreground/65">{order.productName} &middot; {order.quantity} item(s)</p>
        <label htmlFor="vendor-cost" className="mt-6 block text-sm font-semibold">Actual purchase cost per item (PKR)</label>
        <input autoFocus id="vendor-cost" type="number" min="0" max="1000000000" step="0.01" value={value} onChange={(event) => setValue(event.target.value)} disabled={saving} placeholder="Leave blank until vendor confirms" className="mt-2 w-full rounded-xl border border-plum-dark/20 bg-background px-4 py-3 outline-none focus:border-plum focus:ring-2 focus:ring-plum/15" />
        <p className="mt-2 text-xs leading-5 text-foreground/60">Only this order is updated. Leave blank to mark cost as pending; enter 0 only if the item had no purchase cost.</p>
        <div className="mt-5 space-y-3 rounded-xl border border-plum-dark/10 bg-background p-4 text-sm">
          <div className="flex justify-between gap-4"><span className="text-foreground/65">Selling price / item</span><span className="font-semibold">PKR {order.itemPrice.toLocaleString()}</span></div>
          <div className="flex justify-between gap-4"><span className="text-foreground/65">Order gross profit</span><span className={preview?.profit != null && preview.profit < 0 ? 'font-semibold text-red-700' : 'font-semibold text-emerald-700'}>{preview?.profit == null ? 'Cost pending' : 'PKR ' + preview.profit.toLocaleString()}</span></div>
          {preview?.margin != null && <div className="flex justify-between gap-4"><span className="text-foreground/65">Margin</span><span>{preview.margin.toFixed(2)}%</span></div>}
          <p className="border-t border-plum-dark/10 pt-3 text-xs leading-5 text-foreground/55">Profit includes all {order.quantity} item(s), excluding delivery. Only delivered orders contribute to dashboard profit.</p>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={saving} onClick={onClose} className="rounded-full border border-plum-dark/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-50">Cancel</button><button type="submit" disabled={saving || !valid} className="rounded-full bg-plum-dark px-5 py-2.5 text-sm font-semibold text-cream hover:bg-plum disabled:opacity-50">{saving ? 'Saving...' : 'Save purchase cost'}</button></div>
      </form>
    </dialog>
  );
}
