'use client';

import { useState } from 'react';

interface Product {
  id?: string;
  productCode?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  fabric: string;
  images: string[];
  sizes: string[];
  stockStatus: 'In Stock' | 'Out of Stock';
  featured: boolean;
}

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSaved: (product: Product & { id: string }) => void;
}

const emptyProduct: Product = {
  productCode: '',
  name: '',
  description: '',
  price: 0,
  category: 'Everyday Edit',
  fabric: '',
  images: [],
  sizes: [],
  stockStatus: 'In Stock',
  featured: false,
};

export default function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const [form, setForm] = useState<Product>(product ? { ...product } : emptyProduct);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const updateField = (name: string, value: string | number | boolean | string[]) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(event.target.files)) {
        const body = new FormData();
        body.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body });
        if (response.ok) uploaded.push((await response.json()).url);
      }
      setForm((current) => ({ ...current, images: [...current.images, ...uploaded] }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        sizes: form.sizes,
      };
      const response = await fetch(product?.id ? `/api/products/${product.id}` : '/api/products', {
        method: product?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Unable to save product');
      onSaved(await response.json());
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-plum-dark/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-plum-dark/10 bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-plum-dark/10 bg-cream px-5 py-4 md:px-7">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-plum">Catalog</p><h2 id="product-modal-title" className="mt-1 font-serif text-2xl text-plum-dark">{product?.id ? 'Edit product' : 'Add new product'}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close product form" className="text-2xl leading-none text-foreground/50 hover:text-plum-dark">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-5 md:p-7">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-foreground">Product code<input value={form.productCode || ''} onChange={(e) => updateField('productCode', e.target.value)} placeholder="Auto-generated if blank" className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label>
            <label className="text-sm font-medium text-foreground">Product name<input required value={form.name} onChange={(e) => updateField('name', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label>
          </div>
          <label className="block text-sm font-medium text-foreground">Description<textarea required rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-foreground">Price (PKR)<input required type="number" min="0" value={form.price || ''} onChange={(e) => updateField('price', Number(e.target.value))} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label>
            <label className="text-sm font-medium text-foreground">Category<select value={form.category} onChange={(e) => updateField('category', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum"><option>Everyday Edit</option><option>Hand Embroidered</option><option>Occasion</option><option>Minimal</option></select></label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-foreground">Fabric / material<input required value={form.fabric} onChange={(e) => updateField('fabric', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label>
            <label className="text-sm font-medium text-foreground">Sizes<input value={form.sizes.join(', ')} onChange={(e) => updateField('sizes', e.target.value.split(',').map((size) => size.trim()).filter(Boolean))} placeholder="52, 54, 56" className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum" /></label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-foreground">Stock status<select value={form.stockStatus} onChange={(e) => updateField('stockStatus', e.target.value)} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm outline-none focus:border-plum"><option>In Stock</option><option>Out of Stock</option></select></label>
            <label className="flex items-center gap-3 pt-7 text-sm font-medium text-foreground"><input type="checkbox" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} className="h-4 w-4 accent-plum" /> Featured product</label>
          </div>
          <label className="block text-sm font-medium text-foreground">Product images<input type="file" multiple accept="image/*" onChange={handleImages} disabled={uploading} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-cream px-3 py-2.5 text-sm" />{uploading && <span className="mt-2 block text-xs text-plum">Uploading images...</span>}</label>
          {form.images.length > 0 && <div className="grid grid-cols-4 gap-3">{form.images.map((image, index) => <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden bg-rose-light"><img src={image} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))} className="absolute right-1 top-1 h-6 w-6 rounded-full bg-plum-dark text-cream">×</button></div>)}</div>}
          <div className="flex gap-3 border-t border-plum-dark/10 pt-5"><button type="submit" disabled={saving || uploading} className="flex-1 rounded-full bg-plum-dark px-5 py-3 text-sm font-semibold text-cream hover:bg-plum disabled:opacity-50">{saving ? 'Saving...' : product?.id ? 'Save changes' : 'Create product'}</button><button type="button" onClick={onClose} className="rounded-full border border-plum-dark/20 px-5 py-3 text-sm font-semibold text-plum-dark hover:bg-rose-light">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}
