'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DeliveryZone {
  id: string;
  cityName: string;
  deliveryCharge: number;
  updatedAt: string;
}

export default function DeliveryZonesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cityName: '',
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
          setZones(data);
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'deliveryCharge' ? parseFloat(value) : value });
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
        setZones([...zones, newZone]);
        setFormData({ cityName: '', deliveryCharge: 0 });
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
        setZones(zones.filter(z => z.id !== id));
      }
    } catch (error) {
      console.error('Error deleting delivery zone:', error);
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
          <h1 className="font-serif text-2xl md:text-3xl text-plum-dark">Delivery Zones</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-plum text-cream px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors text-sm md:text-base"
          >
            {showForm ? 'Cancel' : 'Add Zone'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-cream rounded-lg p-4 md:p-6 mb-6 md:mb-8 border border-rose/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-foreground mb-2">City Name</label>
                <input
                  type="text"
                  name="cityName"
                  value={formData.cityName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                />
              </div>
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

        <div className="bg-cream rounded-lg overflow-hidden border border-rose/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-rose-light">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">City</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Delivery Charge</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 md:px-6 py-6 md:py-8 text-center text-foreground/60 text-sm md:text-base">
                      No delivery zones yet. Add your first zone!
                    </td>
                  </tr>
                ) : (
                  zones.map((zone) => (
                    <tr key={zone.id} className="border-t border-rose/20">
                      <td className="px-4 md:px-6 py-3 md:py-4 text-foreground text-xs md:text-base">{zone.cityName}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-foreground text-xs md:text-base">PKR {zone.deliveryCharge.toLocaleString()}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-xs md:text-sm"
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
