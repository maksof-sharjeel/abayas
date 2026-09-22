'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  fabric: string;
  images: string[];
  sizes?: string[];
  stockStatus: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          router.push('/shop');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id, router]);

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const message = `Hi, I'm interested in ordering: ${product.name} (PKR ${product.price.toLocaleString()})`;
    const whatsappUrl = `https://wa.me/923122789939?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+923122789939';
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Product not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link href="/shop" className="inline-block text-plum hover:text-plum-dark mb-6 md:mb-8 text-sm md:text-base">
            ← Back to Shop
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-rose-light rounded-lg overflow-hidden mb-3 md:mb-4">
                {product.images && product.images[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground/40 text-sm md:text-base">
                    No image
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-rose-light rounded overflow-hidden border-2 ${
                        selectedImage === index ? 'border-plum' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <p className="text-plum font-semibold mb-2 text-sm md:text-base">{product.category}</p>
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-plum-dark mb-3 md:mb-4">{product.name}</h1>
              <p className="text-xl md:text-2xl font-bold text-plum mb-4 md:mb-6">PKR {product.price.toLocaleString()}</p>
              
              <div className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6 ${
                product.stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.stockStatus}
              </div>

              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">Fabric</h3>
                  <p className="text-foreground/70 text-sm md:text-base">{product.fabric}</p>
                </div>
                
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Available Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <span key={size} className="px-3 md:px-4 py-1.5 md:py-2 border border-plum rounded text-plum text-xs md:text-sm">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">Description</h3>
                  <p className="text-foreground/70 whitespace-pre-line text-sm md:text-base">{product.description}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={handleCall}
                  className="flex-1 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg transition-colors bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <span>📞</span>
                  Call Karein
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  disabled={product.stockStatus === 'Out of Stock'}
                  className={`flex-1 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg transition-colors flex items-center justify-center gap-2 ${
                    product.stockStatus === 'In Stock'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>💬</span>
                  {product.stockStatus === 'In Stock' ? 'WhatsApp Order' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
