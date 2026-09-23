'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import LoadingState from '@/components/LoadingState';

interface DeliveryZone {
  id: string;
  deliveryCharge: number;
  updatedAt: string;
}

export default function DeliveryZonesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [setting, setSetting] = useState<DeliveryZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    deliveryCharge: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchZones() {
      try {
        const res = await fetch('/api/delivery-zones');
        if (res.ok) {
          const data = await res.json();
          setSetting(data.id ? data : null);
        }
      } catch (error) {
        console.error('Error fetching delivery zones:', error);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchZones();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ deliveryCharge: parseFloat(e.target.value) || 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/delivery-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newZone = await res.json();
        setSetting(newZone);
        setFormData({ deliveryCharge: newZone.deliveryCharge });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating delivery zone:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery zone?')) return;
    try {
      const res = await fetch(`/api/delivery-zones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSetting(null);
        setFormData({ deliveryCharge: 0 });
      }
    } catch (error) {
      console.error('Error deleting delivery zone:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <AdminLayout><LoadingState label="Loading delivery zones" fullScreen={false} /></AdminLayout>;
  }

  if (!session) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl p-5 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-plum">Shipping setup</p><h1 className="mt-2 font-serif text-3xl text-plum-dark">Nationwide delivery</h1><p className="mt-2 text-sm text-foreground/60">One delivery charge for every city across Pakistan.</p></div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-plum text-cream px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors text-sm md:text-base"
          >
            {showForm ? 'Cancel' : setting ? 'Update Charge' : 'Set Delivery Charge'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-cream rounded-lg p-4 md:p-6 mb-6 md:mb-8 border border-rose/20">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Delivery Charge (PKR)</label>
                <input
                  type="number"
                  name="deliveryCharge"
                  value={formData.deliveryCharge}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                />
              </div>
            </div>
            <div className="mt-4 md:mt-6 flex gap-3 md:gap-4">
              <button
                type="submit"
                className="bg-plum text-cream px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors text-sm md:text-base"
              >
                Save Zone
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-plum text-plum px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum hover:text-cream transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="border border-plum-dark/10 bg-cream p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-plum">Current policy</p>
          <div className="mt-4 flex items-end justify-between gap-4"><div><p className="text-sm text-foreground/60">Delivery across Pakistan</p><p className="mt-1 font-serif text-4xl text-plum-dark">PKR {(setting?.deliveryCharge || 0).toLocaleString()}</p></div>{setting && <button type="button" onClick={() => handleDelete(setting.id)} className="text-sm font-medium text-red-600 hover:text-red-700">Remove setting</button>}</div>
        </div>
      </div>
    </AdminLayout>
  );
}
