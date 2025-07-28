"use client";

import { useState, useEffect, Suspense } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { FaSpinner, FaBox, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaUser, FaPhone, FaMapMarkedAlt } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

interface OrderStatus {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  name: string;
  phone: string;
  address: string;
  city: string;
  price: number;
  createdAt: any;
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [orderDetails, setOrderDetails] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('id')) {
      handleTrack();
    }
  }, []);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderDetails(null);

    try {
      const orderDoc = await getDoc(doc(db, 'book-orders', orderId.trim()));
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      setOrderDetails(orderDoc.data() as OrderStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-tathir-beige pt-24 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <FaBox className="h-12 w-12 text-tathir-dark-green mb-4 animate-float" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-tathir-dark-green/20 rounded-full blur-sm animate-float-shadow" />
          </div>
          <h1 className="text-2xl font-bold text-tathir-dark-green mb-2">Track Your Order</h1>
          <p className="text-sm text-tathir-brown">Enter your order ID to check the current status</p>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-tathir-maroon shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.5)] transition-all duration-300">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-tathir-dark-green mb-1.5">
                Order ID
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-tathir-cream rounded-lg focus:outline-none 
                  focus:border-tathir-light-green bg-tathir-beige/20 text-tathir-dark-gray text-sm
                  shadow-[2px_2px_0_0_rgba(90,58,43,0.3)] group-hover:shadow-[3px_3px_0_0_rgba(90,58,43,0.3)]
                  transition-all duration-300 pr-10"
                  placeholder="Enter your order ID"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tathir-brown text-sm 
                group-hover:text-tathir-dark-green transition-colors duration-300" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-tathir-dark-green text-tathir-beige py-3 px-6 rounded-lg 
              hover:bg-tathir-light-green transition-all duration-300 flex items-center 
              justify-center font-medium border-2 border-transparent text-sm
              hover:border-tathir-cream shadow-[2px_2px_0_0_rgba(90,58,43,0.5)]
              hover:shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] transform hover:-translate-y-1
              focus:outline-none focus:ring-2 focus:ring-tathir-light-green focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-base mr-2" />
                  Tracking...
                </>
              ) : (
                'Track Order'
              )}
            </button>

            {error && (
              <div className="text-sm text-tathir-maroon text-center mt-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-shake">
                {error}
              </div>
            )}
          </form>

          {orderDetails && (
            <div className="mt-8 border-t-2 border-tathir-cream pt-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-tathir-dark-green mb-5 flex items-center">
                <FaBox className="mr-2" />
                Order Details
              </h2>
              
              <div className="space-y-4">
                <div className="bg-tathir-beige/20 p-5 rounded-lg border-2 border-tathir-cream transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-tathir-brown">Status</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize border-2 ${getStatusColor(orderDetails.status)}`}>
                      {orderDetails.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-tathir-beige/20 p-4 rounded-lg border-2 border-tathir-cream hover:bg-tathir-beige/30 transition-all duration-300">
                    <FaCalendarAlt className="text-sm text-tathir-brown mb-2" />
                    <div>
                      <p className="text-xs font-medium text-tathir-brown">Order Date</p>
                      <p className="text-sm font-medium text-tathir-dark-gray">
                        {formatDate(orderDetails.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-tathir-beige/20 p-4 rounded-lg border-2 border-tathir-cream hover:bg-tathir-beige/30 transition-all duration-300">
                    <FaMoneyBillWave className="text-sm text-tathir-brown mb-2" />
                    <div>
                      <p className="text-xs font-medium text-tathir-brown">Amount</p>
                      <p className="text-sm font-medium text-tathir-dark-gray">৳ {orderDetails.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-tathir-beige/20 p-5 rounded-lg border-2 border-tathir-cream space-y-4 hover:bg-tathir-beige/30 transition-colors duration-300">
                  <h3 className="text-sm font-medium text-tathir-dark-green flex items-center">
                    <FaMapMarkedAlt className="mr-2" />
                    Delivery Details
                  </h3>
                  <div className="space-y-3 divide-y-2 divide-tathir-cream/30">
                    <div className="flex items-center pb-3">
                      <FaUser className="text-sm text-tathir-brown mr-3 w-5" />
                      <p className="text-sm font-medium text-tathir-dark-gray">{orderDetails.name}</p>
                    </div>
                    <div className="flex items-center py-3">
                      <FaPhone className="text-sm text-tathir-brown mr-3 w-5" />
                      <p className="text-sm font-medium text-tathir-dark-gray">{orderDetails.phone}</p>
                    </div>
                    <div className="flex items-start pt-3">
                      <FaMapMarkerAlt className="text-sm text-tathir-brown mr-3 w-5 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-tathir-dark-gray">{orderDetails.address}</p>
                        <p className="text-sm font-medium text-tathir-dark-gray mt-1">{orderDetails.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-tathir-beige pt-24 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 text-tathir-dark-green animate-spin mx-auto mb-4" />
          <p className="text-tathir-brown">Loading track page...</p>
        </div>
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
} 