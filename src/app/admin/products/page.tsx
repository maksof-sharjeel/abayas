'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stockStatus: string;
  featured: boolean;
}

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchProducts();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
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
          <h1 className="font-serif text-3xl text-plum-dark">Products</h1>
          <Link
            href="/admin/products/new"
            className="bg-plum text-cream px-6 py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors"
          >
            Add New Product
          </Link>
        </div>

        <div className="bg-cream rounded-lg overflow-hidden border border-rose/20">
          <table className="w-full">
            <thead className="bg-rose-light">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Featured</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-plum-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-foreground/60">
                    No products yet. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-t border-rose/20">
                    <td className="px-6 py-4 text-foreground">{product.name}</td>
                    <td className="px-6 py-4 text-foreground/70">{product.category}</td>
                    <td className="px-6 py-4 text-foreground">PKR {product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stockStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.featured ? '⭐' : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="text-plum hover:text-plum-dark font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-700 font-medium"
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
  );
}
