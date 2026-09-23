'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProductFormModal from '@/components/ProductFormModal';
import LoadingState from '@/components/LoadingState';

interface Product {
  id: string;
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

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const openEditModal = async (id: string) => {
    const response = await fetch(`/api/products/${id}`);
    if (response.ok) {
      setEditingProduct(await response.json());
      setModalOpen(true);
    }
  };

  if (status === 'loading' || loading) {
    return <AdminLayout><LoadingState label="Loading products" fullScreen={false} /></AdminLayout>;
  }

  if (!session) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="font-serif text-2xl md:text-3xl text-plum-dark">Products</h1>
          <button
            type="button"
            onClick={() => { setEditingProduct(null); setModalOpen(true); }}
            className="rounded-full bg-plum-dark px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-plum"
          >
            Add New Product
          </button>
        </div>

        <div className="bg-cream rounded-lg overflow-hidden border border-rose/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-150">
              <thead className="bg-rose-light">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Name</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Category</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Price</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Stock</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Featured</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-plum-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 md:px-6 py-6 md:py-8 text-center text-foreground/60 text-sm md:text-base">
                      No products yet. Add your first product!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t border-rose/20">
                      <td className="px-4 md:px-6 py-3 md:py-4 text-foreground text-xs md:text-base">{product.name}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-foreground/70 text-xs md:text-base">{product.category}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-foreground text-xs md:text-base">PKR {product.price.toLocaleString()}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold ${
                          product.stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stockStatus}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        {product.featured ? '⭐' : '-'}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(product.id)}
                            className="text-xs font-medium text-plum hover:text-plum-dark md:text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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
      {modalOpen && <ProductFormModal product={editingProduct} onClose={() => setModalOpen(false)} onSaved={(savedProduct) => setProducts((current) => editingProduct ? current.map((product) => product.id === savedProduct.id ? savedProduct : product) : [savedProduct, ...current])} />}
    </AdminLayout>
  );
}
