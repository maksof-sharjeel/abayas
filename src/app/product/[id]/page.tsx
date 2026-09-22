'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Product {
  _id: string;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/shop" className="inline-block text-plum hover:text-plum-dark mb-8">
            ← Back to Shop
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-rose-light rounded-lg overflow-hidden mb-4">
                {product.images && product.images[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground/40">
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
              <p className="text-plum font-semibold mb-2">{product.category}</p>
              <h1 className="font-serif text-3xl md:text-4xl text-plum-dark mb-4">{product.name}</h1>
              <p className="text-2xl font-bold text-plum mb-6">PKR {product.price.toLocaleString()}</p>
              
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-6 ${
                product.stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.stockStatus}
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Fabric</h3>
                  <p className="text-foreground/70">{product.fabric}</p>
                </div>
                
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Available Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <span key={size} className="px-4 py-2 border border-plum rounded text-plum">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Description</h3>
                  <p className="text-foreground/70 whitespace-pre-line">{product.description}</p>
                </div>
              </div>

              <button
                onClick={handleWhatsAppOrder}
                disabled={product.stockStatus === 'Out of Stock'}
                className={`w-full py-4 rounded-full font-semibold text-lg transition-colors ${
                  product.stockStatus === 'In Stock'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.stockStatus === 'In Stock' ? 'Order on WhatsApp' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
