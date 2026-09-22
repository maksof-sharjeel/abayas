'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PaymentMethod {
  id: string;
  name: string;
  instructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentMethodsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    isActive: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchMethods() {
      try {
        const res = await fetch('/api/payment-methods');
        if (res.ok) {
          const data = await res.json();
          setMethods(data);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchMethods();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMethod 
        ? `/api/payment-methods/${editingMethod.id}`
        : '/api/payment-methods';
      
      const res = await fetch(url, {
        method: editingMethod ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const updatedMethod = await res.json();
        if (editingMethod) {
          setMethods(methods.map(m => m.id === editingMethod.id ? updatedMethod : m));
        } else {
          setMethods([...methods, updatedMethod]);
        }
        setFormData({ name: '', instructions: '', isActive: true });
        setEditingMethod(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      instructions: method.instructions || '',
      isActive: method.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMethods(methods.filter(m => m.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const method = methods.find(m => m.id === id);
      if (!method) return;

      const res = await fetch(`/api/payment-methods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...method, isActive: !currentStatus }),
      });
      
      if (res.ok) {
        setMethods(methods.map(m => m.id === id ? { ...m, isActive: !currentStatus } : m));
      }
    } catch (error) {
      console.error('Error toggling payment method:', error);
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
          <h1 className="font-serif text-2xl md:text-3xl text-plum-dark">Payment Methods</h1>
          <button
            onClick={() => {
              setEditingMethod(null);
              setFormData({ name: '', instructions: '', isActive: true });
              setShowForm(!showForm);
            }}
            className="bg-plum text-cream px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors text-sm md:text-base"
          >
            {showForm ? 'Cancel' : 'Add Method'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-cream rounded-lg p-4 md:p-6 mb-6 md:mb-8 border border-rose/20">
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Method Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Cash on Delivery, EasyPaisa, JazzCash"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Instructions (Optional)</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Account number, JazzCash number, etc."
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-rose/30"
                />
                <label htmlFor="isActive" className="text-xs md:text-sm text-foreground">
                  Active (show to customers)
                </label>
              </div>
            </div>
            <div className="mt-4 md:mt-6 flex gap-3 md:gap-4">
              <button
                type="submit"
                className="bg-plum text-cream px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors text-sm md:text-base"
              >
                {editingMethod ? 'Update Method' : 'Add Method'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMethod(null);
                }}
                className="border border-plum text-plum px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum hover:text-cream transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="bg-cream rounded-lg overflow-hidden border border-rose/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-rose-light">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Name</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Instructions</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Status</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {methods.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 md:px-6 py-6 md:py-8 text-center text-foreground/60 text-sm md:text-base">
                      No payment methods yet. Add your first method!
                    </td>
                  </tr>
                ) : (
                  methods.map((method) => (
                    <tr key={method.id} className="border-t border-rose/20">
                      <td className="px-4 md:px-6 py-3 md:py-4 text-foreground text-xs md:text-base font-medium">{method.name}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-foreground/70 text-xs md:text-base max-w-xs truncate">{method.instructions || '-'}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <button
                          onClick={() => handleToggleActive(method.id, method.isActive)}
                          className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold ${
                            method.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {method.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(method)}
                            className="text-plum hover:text-plum-dark font-medium text-xs md:text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(method.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-xs md:text-sm"
                          >
                            Delete
                          </button>
                        </div>
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
