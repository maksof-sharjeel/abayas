'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  productCode?: string;
  name: string;
  price: number;
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

export default function NewOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    productId: '',
    quantity: 1,
    size: '',
    orderSource: 'Phone',
    paymentMethodId: '',
    deliveryChargePaid: false,
    deliveryChargeScreenshot: null as File | null,
    notes: '',
  });
  const [deliveryCharge, setDeliveryCharge] = useState(0);

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
      }
    }
    if (session) fetchProducts();
  }, [session]);

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
    if (session) fetchDeliveryZones();
  }, [session]);

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
    if (session) fetchPaymentMethods();
  }, [session]);

  useEffect(() => {
    // Update delivery charge when city changes
    const zone = deliveryZones.find(z => z.cityName === formData.customerCity);
    setDeliveryCharge(zone ? zone.deliveryCharge : 0);
  }, [formData.customerCity, deliveryZones]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const product = products.find(p => p.id === formData.productId);
      if (!product) {
        alert('Please select a product');
        setLoading(false);
        return;
      }

      // Upload delivery charge screenshot if provided
      let deliveryChargeScreenshotUrl = '';
      if (formData.deliveryChargeScreenshot) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.deliveryChargeScreenshot);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          deliveryChargeScreenshotUrl = uploadData.url;
        }
      }

      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerCity: formData.customerCity,
        productId: formData.productId,
        productName: product.name,
        quantity: parseInt(formData.quantity.toString()),
        size: formData.size,
        itemPrice: product.price,
        deliveryCharge,
        totalPrice: (product.price * parseInt(formData.quantity.toString())) + deliveryCharge,
        orderSource: formData.orderSource,
        paymentMethodId: formData.paymentMethodId,
        deliveryChargePaid: formData.deliveryChargePaid,
        deliveryChargeScreenshotUrl,
        notes: formData.notes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const order = await res.json();
        alert(`Order recorded successfully! Tracking Code: ${order.trackingCode}`);
        router.push('/admin/orders');
      } else {
        alert('Failed to record order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to record order');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
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
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-2xl md:text-3xl text-plum-dark mb-6 md:mb-8">Add Manual Order</h1>
          
          <form onSubmit={handleSubmit} className="bg-cream rounded-lg p-6 md:p-8 border border-rose/20 space-y-4 md:space-y-6">
            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Customer Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Customer Phone *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Customer Address</label>
              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">City</label>
              <select
                name="customerCity"
                value={formData.customerCity}
                onChange={handleChange}
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

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Product *</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.productCode ? `${product.productCode} - ` : ''}{product.name} - PKR {product.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Size</label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g., S, M, L, XL"
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Total Price</label>
              <input
                type="text"
                value={`PKR ${formData.productId ? ((products.find(p => p.id === formData.productId)?.price || 0) * formData.quantity + deliveryCharge).toLocaleString() : '0'}`}
                readOnly
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg bg-rose-light text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Order Source</label>
              <select
                name="orderSource"
                value={formData.orderSource}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
              >
                <option value="Phone">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Payment Method</label>
              <select
                name="paymentMethodId"
                value={formData.paymentMethodId}
                onChange={handleChange}
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="deliveryChargePaid"
                id="deliveryChargePaid"
                checked={formData.deliveryChargePaid}
                onChange={handleChange}
                className="w-4 h-4 rounded border-rose/30"
              />
              <label htmlFor="deliveryChargePaid" className="text-xs md:text-sm text-foreground">
                Delivery Charge Paid
              </label>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Delivery Charge Screenshot (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, deliveryChargeScreenshot: e.target.files?.[0] || null })}
                className="w-full text-xs md:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum text-sm md:text-base"
              />
            </div>

            <div className="flex gap-3 md:gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-plum text-cream px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors text-sm md:text-base disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Order'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="flex-1 border border-plum text-plum px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:bg-plum hover:text-cream transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
