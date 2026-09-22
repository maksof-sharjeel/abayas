'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function AdminCategories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchCategories();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newCategory = await res.json();
        setCategories([...categories, newCategory]);
        setFormData({ name: '', slug: '', description: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-plum-dark text-cream px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/admin/dashboard" className="font-serif text-2xl hover:text-gold">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user?.email}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl text-plum-dark">Categories</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-plum text-cream px-6 py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors"
          >
            {showForm ? 'Cancel' : 'Add New Category'}
          </button>
        </div>

        {showForm && (
          <div className="bg-cream rounded-lg p-6 mb-8 border border-rose/20">
            <h2 className="font-serif text-xl text-plum-dark mb-4">New Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description (optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum"
                />
              </div>
              <button
                type="submit"
                className="bg-plum text-cream px-6 py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors"
              >
                Create Category
              </button>
            </form>
          </div>
        )}

        <div className="bg-cream rounded-lg overflow-hidden border border-rose/20">
          <table className="w-full">
            <thead className="bg-rose-light">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-foreground/60">
                    No categories yet. Add your first category!
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="border-t border-rose/20">
                    <td className="px-6 py-4 text-foreground">{category.name}</td>
                    <td className="px-6 py-4 text-foreground/70">{category.slug}</td>
                    <td className="px-6 py-4 text-foreground/70">{category.description || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-700 font-medium"
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
  );
}
