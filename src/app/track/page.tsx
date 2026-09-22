'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Order {
  trackingCode: string;
  customerName: string;
  productName: string;
  quantity: number;
  size?: string;
  itemPrice: number;
  deliveryCharge: number;
  totalPrice: number;
  status: string;
  orderSource: string;
  createdAt: string;
  paymentMethod?: {
    name: string;
  };
}

export default function TrackOrderPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders?trackingCode=${trackingCode}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else if (res.status === 404) {
        setError('Order not found. Please check your tracking code.');
      } else {
        setError('Failed to fetch order. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to fetch order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-plum-dark mb-6 md:mb-8 text-center">Track Your Order</h1>
          
          <form onSubmit={handleSearch} className="mb-6 md:mb-8">
            <div className="flex gap-3 md:gap-4">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                placeholder="Enter tracking code (e.g., ORD-1234)"
                required
                className="flex-1 px-4 md:px-6 py-3 md:py-4 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-plum text-cream px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-plum-dark transition-colors text-sm md:text-base disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 md:p-6 rounded-lg mb-6 md:mb-8 text-center">
              <p className="text-red-800 text-sm md:text-base">{error}</p>
            </div>
          )}

          {order && (
            <div className="bg-cream rounded-lg p-6 md:p-8 border border-rose/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-plum-dark mb-2">Order Details</h2>
                  <p className="text-plum font-semibold text-lg md:text-xl">Tracking Code: {order.trackingCode}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm md:text-base font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Product</h3>
                    <p className="text-foreground/70 text-sm md:text-base">{order.productName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Quantity</h3>
                    <p className="text-foreground/70 text-sm md:text-base">{order.quantity}</p>
                  </div>
                  {order.size && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Size</h3>
                      <p className="text-foreground/70 text-sm md:text-base">{order.size}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Order Date</h3>
                    <p className="text-foreground/70 text-sm md:text-base">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border-t border-rose/20 pt-4 md:pt-6">
                  <h3 className="font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">Price Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-foreground/70">Item Price</span>
                      <span className="text-foreground">PKR {order.itemPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-foreground/70">Delivery Charge</span>
                      <span className="text-foreground">PKR {order.deliveryCharge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg md:text-xl font-bold text-plum pt-2 border-t border-rose/20">
                      <span>Total</span>
                      <span>PKR {order.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {order.paymentMethod && (
                  <div className="border-t border-rose/20 pt-4 md:pt-6">
                    <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Payment Method</h3>
                    <p className="text-foreground/70 text-sm md:text-base">{order.paymentMethod.name}</p>
                  </div>
                )}

                <div className="border-t border-rose/20 pt-4 md:pt-6">
                  <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Order Source</h3>
                  <p className="text-foreground/70 text-sm md:text-base">{order.orderSource}</p>
                </div>
              </div>

              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-rose/20">
                <Link href="/shop" className="inline-block text-plum hover:text-plum-dark text-sm md:text-base">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
