'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  productCode?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  fabric: string;
  images: string[];
  sizes?: string[];
  stockStatus: string;
}

interface DeliveryZone {
  id: string;
  cityName: string;
  deliveryCharge: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  instructions?: string;
  isActive: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Order form state
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  
  const [orderFormData, setOrderFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    size: '',
    quantity: 1,
    paymentMethodId: '',
    deliveryChargeScreenshot: null as File | null,
  });
  const [deliveryCharge, setDeliveryCharge] = useState(0);

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

  useEffect(() => {
    async function fetchDeliveryZones() {
      try {
        const res = await fetch('/api/delivery-zones');
        if (res.ok) {
          const data = await res.json();
          setDeliveryZones(data);
        }
      } catch (error) {
        console.error('Error fetching delivery zones:', error);
      }
    }
    fetchDeliveryZones();
  }, []);

  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const res = await fetch('/api/payment-methods');
        if (res.ok) {
          const data = await res.json();
          setPaymentMethods(data.filter((m: PaymentMethod) => m.isActive));
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    }
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    // Update delivery charge when city changes
    const zone = deliveryZones.find(z => z.cityName === orderFormData.customerCity);
    setDeliveryCharge(zone ? zone.deliveryCharge : 0);
  }, [orderFormData.customerCity, deliveryZones]);

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const message = `Hi, I'm interested in ordering: ${product.name} (PKR ${product.price.toLocaleString()})`;
    const whatsappUrl = `https://wa.me/923122789939?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+923122789939';
  };

  const handleOrderFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderFormData({ ...orderFormData, [name]: value });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setOrderLoading(true);

    try {
      // Upload delivery charge screenshot
      let deliveryChargeScreenshotUrl = '';
      if (orderFormData.deliveryChargeScreenshot) {
        const formData = new FormData();
        formData.append('file', orderFormData.deliveryChargeScreenshot);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          deliveryChargeScreenshotUrl = uploadData.url;
        }
      }

      const orderData = {
        customerName: orderFormData.customerName,
        customerPhone: orderFormData.customerPhone,
        customerAddress: orderFormData.customerAddress,
        customerCity: orderFormData.customerCity,
        productId: product.id,
        productName: product.name,
        quantity: orderFormData.quantity,
        size: orderFormData.size,
        itemPrice: product.price,
        deliveryCharge,
        totalPrice: (product.price * orderFormData.quantity) + deliveryCharge,
        orderSource: 'Website',
        paymentMethodId: orderFormData.paymentMethodId,
        deliveryChargePaid: true,
        deliveryChargeScreenshotUrl,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const order = await res.json();
        setTrackingCode(order.trackingCode);
        setOrderSuccess(true);
        setShowOrderForm(false);
      } else {
        alert('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setOrderLoading(false);
    }
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
              {product.productCode && (
                <p className="text-plum/70 text-xs md:text-sm mb-2">Code: {product.productCode}</p>
              )}
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

              {/* Order Now Button */}
              {product.stockStatus === 'In Stock' && (
                <button
                  onClick={() => setShowOrderForm(!showOrderForm)}
                  className="w-full mt-4 md:mt-6 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg transition-colors bg-plum text-cream hover:bg-plum-dark"
                >
                  {showOrderForm ? 'Cancel Order' : 'Order Now'}
                </button>
              )}

              {/* Order Form */}
              {showOrderForm && (
                <form onSubmit={handleOrderSubmit} className="mt-6 p-6 bg-rose-light rounded-lg space-y-4">
                  <h3 className="font-serif text-xl text-plum-dark mb-4">Order Details</h3>
                  
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={orderFormData.customerName}
                      onChange={handleOrderFormChange}
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={orderFormData.customerPhone}
                      onChange={handleOrderFormChange}
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Address *</label>
                    <textarea
                      name="customerAddress"
                      value={orderFormData.customerAddress}
                      onChange={handleOrderFormChange}
                      required
                      rows={2}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground mb-2">City *</label>
                    <select
                      name="customerCity"
                      value={orderFormData.customerCity}
                      onChange={handleOrderFormChange}
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                    >
                      <option value="">Select City</option>
                      {deliveryZones.map((zone) => (
                        <option key={zone.id} value={zone.cityName}>
                          {zone.cityName} (PKR {zone.deliveryCharge.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {deliveryCharge > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Delivery Charge:</strong> PKR {deliveryCharge.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Size</label>
                      <select
                        name="size"
                        value={orderFormData.size}
                        onChange={handleOrderFormChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                      >
                        <option value="">Select Size</option>
                        {product.sizes.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={orderFormData.quantity}
                      onChange={handleOrderFormChange}
                      min="1"
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Payment Method *</label>
                    <select
                      name="paymentMethodId"
                      value={orderFormData.paymentMethodId}
                      onChange={handleOrderFormChange}
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
                    >
                      <option value="">Select Payment Method</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {orderFormData.paymentMethodId && (() => {
                    const method = paymentMethods.find(m => m.id === orderFormData.paymentMethodId);
                    if (method?.instructions) {
                      return (
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                          <p className="text-xs md:text-sm text-blue-800 whitespace-pre-line">{method.instructions}</p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {deliveryCharge > 0 && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <p className="text-xs md:text-sm text-red-800 mb-2">
                        <strong>Required:</strong> Upload screenshot of delivery charge payment (PKR {deliveryCharge.toLocaleString()})
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setOrderFormData({ ...orderFormData, deliveryChargeScreenshot: e.target.files?.[0] || null })}
                        required
                        className="w-full text-xs md:text-sm"
                      />
                    </div>
                  )}

                  <div className="bg-plum/10 p-3 rounded-lg">
                    <p className="text-sm md:text-base text-plum-dark">
                      <strong>Total:</strong> PKR {((product.price * orderFormData.quantity) + deliveryCharge).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={orderLoading}
                    className="w-full bg-plum text-cream py-3 md:py-4 rounded-full font-semibold hover:bg-plum-dark transition-colors text-sm md:text-base disabled:opacity-50"
                  >
                    {orderLoading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>
              )}

              {/* Order Success Message */}
              {orderSuccess && (
                <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Order Placed Successfully!</h3>
                  <p className="text-sm text-green-700 mb-2">Your tracking code is:</p>
                  <p className="text-2xl font-bold text-green-900 mb-4">{trackingCode}</p>
                  <p className="text-xs md:text-sm text-green-700">Save this code to track your order status.</p>
                  <Link href="/track" className="inline-block mt-4 text-green-800 underline text-sm md:text-base">
                    Track Your Order
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
