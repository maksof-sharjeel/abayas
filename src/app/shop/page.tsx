'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSearchParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  stockStatus: string;
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const categories = ['All', 'Plain', 'Design', 'Simple'];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-plum-dark mb-6 md:mb-8 text-center">Shop Collection</h1>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 md:px-6 py-2 rounded-full font-semibold transition-colors text-sm md:text-base ${
                  selectedCategory === category
                    ? 'bg-plum text-cream'
                    : 'bg-rose-light text-plum-dark hover:bg-rose'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-foreground/60 text-sm md:text-base">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-foreground/60 text-sm md:text-base">No products found</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="bg-cream rounded-lg md:rounded-xl overflow-hidden hover:shadow-lg transition-shadow transform hover:-translate-y-1 border border-rose/20"
                >
                  <div className="aspect-square bg-rose-light relative">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/40 text-xs md:text-sm">
                        No image
                      </div>
                    )}
                    {product.stockStatus === 'Out of Stock' && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <p className="text-[10px] md:text-sm text-plum mb-1">{product.category}</p>
                    <h3 className="font-semibold text-foreground mb-1 md:mb-2 text-xs md:text-base line-clamp-2">{product.name}</h3>
                    <p className="text-plum font-bold text-sm md:text-base mb-2 md:mb-3">PKR {product.price.toLocaleString()}</p>
                    <div className="flex flex-col gap-2">
                      <a
                        href={`tel:+923122789939`}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-full bg-blue-600 text-white text-[10px] md:text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <span>📞</span> Call
                      </a>
                      <a
                        href={`https://wa.me/923122789939?text=${encodeURIComponent(`Hi, I'm interested in: ${product.name} (PKR ${product.price.toLocaleString()})`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 rounded-full bg-green-600 text-white text-[10px] md:text-xs font-semibold hover:bg-green-700 transition-colors"
                      >
                        <span>💬</span> WhatsApp
                      </a>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
