"use client";

import { useState } from 'react';
import { X, Loader2, Copy, User, Phone, Mail, MapPin, Building, StickyNote, Check, Truck, Plus, Minus, Package } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { toast } from 'sonner';
import { InfoCard } from '@/components/shared/data/InfoCard';
import { bloxat } from '@/components/fonts';

interface OrderFormProps {
  price: number;
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  quantity: number;
  deliveryZone: 'inside-dhaka' | 'dhaka-suburban' | 'outside-dhaka';
  notes?: string;
}

export default function OrderForm({ price, onClose }: OrderFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    quantity: 1,
    deliveryZone: 'inside-dhaka',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [orderSummary, setOrderSummary] = useState<{
    totalAmount: number;
    deliveryCharge: number;
    deliveryZone: string;
  } | null>(null);

  // Calculate delivery charge based on zone
  const getDeliveryCharge = (zone: string) => {
    switch (zone) {
      case 'inside-dhaka':
        return 90;
      case 'dhaka-suburban':
        return 120;
      case 'outside-dhaka':
        return 150;
      default:
        return 90;
    }
  };

  // Get delivery zone label
  const getDeliveryZoneLabel = (zone: string) => {
    switch (zone) {
      case 'inside-dhaka':
        return 'Inside Dhaka';
      case 'dhaka-suburban':
        return 'Dhaka Suburban';
      case 'outside-dhaka':
        return 'Outside Dhaka';
      default:
        return 'Inside Dhaka';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.name || !formData.phone || !formData.address || !formData.city) {
        throw new Error('Please fill in all required fields');
      }

      // Quantity validation
      if (formData.quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      // Phone number validation (Bangladesh format)
      const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
        throw new Error('Please enter a valid Bangladesh phone number');
      }

      // Email validation (if provided)
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Calculate total price
      const totalBookPrice = price * formData.quantity;
      const deliveryCharge = getDeliveryCharge(formData.deliveryZone);
      const totalAmount = totalBookPrice + deliveryCharge;

      // Create order document
      const orderDoc = await addDoc(collection(db, 'book-orders'), {
        ...formData,
        price: totalBookPrice,
        unitPrice: price,
        deliveryCharge: deliveryCharge,
        deliveryZoneLabel: getDeliveryZoneLabel(formData.deliveryZone),
        totalAmount: totalAmount,
        status: 'pending',
        createdAt: serverTimestamp(),
        orderNumber: `BO-${Date.now()}`,
        deliveryMethod: 'home' // Always home delivery
      });

      setOrderId(orderDoc.id);
      setOrderSummary({
        totalAmount: totalAmount,
        deliveryCharge: deliveryCharge,
        deliveryZone: getDeliveryZoneLabel(formData.deliveryZone)
      });
      setSuccess(true);
      toast.success('Order placed successfully!');

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleQuantityChange = (increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      quantity: increment 
        ? prev.quantity + 1
        : Math.max(prev.quantity - 1, 1)
    }));
    setError('');
  };

  if (success) {
    return (
      <div className="bg-tathir-beige p-6 rounded-lg border-2 border-tathir-brown/20 max-w-md mx-auto">
        <InfoCard
          title="Order Placed Successfully!"
          icon={<Check className="w-8 h-8 text-tathir-dark-green" />}
          variant="public"
          content={
            <div className="space-y-4 text-center">
              <p className="text-tathir-brown">
                Your order has been placed successfully. Thanks for your enthusiasm and patience. The book is on print.
              </p>
              
              <div className="bg-tathir-cream p-4 rounded-lg border border-tathir-brown/20">
                <p className={`text-sm font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                  Order ID:
                </p>
                <div className="flex items-center justify-between bg-tathir-beige p-2 rounded border">
                  <span className="text-tathir-dark-green font-mono text-sm">{orderId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(orderId);
                      toast.success('Order ID copied to clipboard');
                    }}
                    className="p-1 text-tathir-dark-green hover:text-tathir-brown transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-tathir-cream p-4 rounded-lg border border-tathir-brown/20">
                <h4 className={`font-bold text-tathir-dark-green mb-2 flex items-center gap-2 ${bloxat.className}`}>
                  <Truck className="w-4 h-4" />
                  What's Next?
                </h4>
                <ul className="text-sm text-tathir-brown space-y-1 text-left">
                  <li>• We'll call you after we get the book</li>
                  <li>• Pay cash on delivery</li>
                  <li>• Keep your Order ID for reference</li>
                  {orderSummary && (
                    <li>• Total amount: ৳{orderSummary.totalAmount.toLocaleString()} ({orderSummary.deliveryZone})</li>
                  )}
                </ul>
              </div>

              <button
                onClick={onClose}
                className={`w-full px-6 py-3 bg-tathir-dark-green text-tathir-cream font-bold rounded-lg hover:bg-tathir-brown transition-colors ${bloxat.className}`}
              >
                Close
              </button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-tathir-beige rounded-lg border-2 border-tathir-brown/20 max-w-2xl mx-auto">
      <InfoCard
        title="Preorder Your Book"
        icon={<Truck className="w-8 h-8 text-tathir-dark-green" />}
        variant="public"
        content={
          <div className="space-y-6">
            {/* Close button */}
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-tathir-brown text-sm">Home Delivery • Cash on Delivery</p>
                <p className={`text-2xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                  ৳ {price.toLocaleString()} per book
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-tathir-brown hover:text-tathir-dark-green transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className={`flex items-center gap-2 text-tathir-dark-green font-bold mb-2 ${bloxat.className}`}>
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:outline-none focus:border-tathir-dark-green bg-white text-tathir-brown transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className={`flex items-center gap-2 text-tathir-dark-green font-bold mb-2 ${bloxat.className}`}>
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:outline-none focus:border-tathir-dark-green bg-white text-tathir-brown transition-colors"
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className={`flex items-center gap-2 text-tathir-dark-green font-bold mb-2 ${bloxat.className}`}>
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:outline-none focus:border-tathir-dark-green bg-white text-tathir-brown transition-colors"
                  placeholder="your.email@example.com (optional)"
                />
              </div>

              {/* Address Field */}
              <div>
                <label className={`flex items-center gap-2 text-tathir-dark-green font-bold mb-2 ${bloxat.className}`}>
                  <MapPin className="w-4 h-4" />
                  Full Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:outline-none focus:border-tathir-dark-green bg-white text-tathir-brown transition-colors"
                  placeholder="House/Flat, Road, Area"
                  required
                />
              </div>

              {/* City Field */}
              <div>
                <label className={`flex items-center gap-2 text-tathir-dark-green font-bold mb-2 ${bloxat.className}`}>
                  <Building className="w-4 h-4" />
                  City/District *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:outline-none focus:border-tathir-dark-green bg-white text-tathir-brown transition-colors"
                  placeholder="Dhaka, Chittagong, etc."
                  required
                />
              </div>

              {/* Postal Code Field */}
              <div>
                <label className={`flex items-center gap-2 text-tathir-dark-green font-bold mb-2 ${bloxat.className}`}>
                  <MapPin className="w-4 h-4" />
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:outline-none focus:border-tathir-dark-green bg-white text-tathir-brown transition-colors"
                  placeholder="1000 (helps with accurate delivery)"
                />
              </div>

              {/* Delivery Zone Field */}
              <div>
                <label className={`flex items-center gap-2 text-tathir-dark-green font-bold mb-2 ${bloxat.className}`}>
                  <Truck className="w-4 h-4" />
                  Delivery Zone *
                </label>
                <select
                  name="deliveryZone"
                  value={formData.deliveryZone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:outline-none focus:border-tathir-dark-green bg-white text-tathir-brown transition-colors"
                  required
                >
                  <option value="inside-dhaka">Inside Dhaka - ৳90</option>
                  <option value="dhaka-suburban">Dhaka Suburban - ৳120</option>
                  <option value="outside-dhaka">Outside Dhaka - ৳150</option>
                </select>
                <p className="text-xs text-tathir-brown mt-1">
                  Choose your delivery area for accurate pricing
                </p>
              </div>

              {/* Quantity Field */}
              <div>
                <label className={`flex items-center gap-2 text-tathir-dark-green font-bold mb-2 ${bloxat.className}`}>
                  <Package className="w-4 h-4" />
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-tathir-brown/20 rounded-lg bg-white">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(false)}
                      disabled={formData.quantity <= 1}
                      className="p-3 text-tathir-dark-green hover:bg-tathir-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 text-tathir-brown font-bold border-x-2 border-tathir-brown/20">
                      {formData.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(true)}
                      className="p-3 text-tathir-dark-green hover:bg-tathir-cream transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <label className={`flex items-center gap-2 text-tathir-dark-green font-bold mb-2 ${bloxat.className}`}>
                  <StickyNote className="w-4 h-4" />
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:outline-none focus:border-tathir-dark-green bg-white text-tathir-brown transition-colors resize-none"
                  placeholder="Any special delivery instructions (optional)"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-4 bg-tathir-dark-green text-tathir-cream font-bold rounded-lg hover:bg-tathir-brown transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${bloxat.className}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    Place Order - Home Delivery (COD)
                  </>
                )}
              </button>
            </form>

            {/* Order Summary */}
            <div className="bg-tathir-cream p-4 rounded-lg border border-tathir-brown/20">
              <h4 className={`font-bold text-tathir-dark-green mb-3 ${bloxat.className}`}>
                Order Summary:
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-tathir-brown">
                  <span>Complete IBA Guide × {formData.quantity}</span>
                  <span className={`font-bold text-tathir-dark-green ${bloxat.className}`}>
                    ৳ {(price * formData.quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-tathir-brown">
                  <span>Delivery ({getDeliveryZoneLabel(formData.deliveryZone)})</span>
                  <span className="text-tathir-dark-green font-bold">
                    ৳ {getDeliveryCharge(formData.deliveryZone)}
                  </span>
                </div>
                <hr className="my-2 border-tathir-brown/20" />
                <div className="flex justify-between items-center font-bold text-tathir-dark-green">
                  <span>Total (Cash on Delivery)</span>
                  <span className={bloxat.className}>
                    ৳ {(price * formData.quantity + getDeliveryCharge(formData.deliveryZone)).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-tathir-beige rounded border border-tathir-brown/20">
                <p className="text-xs text-tathir-brown">
                  <strong>Note:</strong> For orders with multiple books, delivery charges may be adjusted during confirmation call based on total weight and size.
                </p>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}