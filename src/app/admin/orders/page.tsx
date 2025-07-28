"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { FaSpinner, FaShoppingCart, FaUser, FaPhone, FaMapMarkerAlt, FaBox, FaClock, FaCheckCircle, FaTruck, FaTimesCircle, FaChevronDown } from 'react-icons/fa';
import { toast } from 'sonner';

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  name: string;
  phone: string;
  address: string;
  city: string;
  price: number;
  createdAt: any;
}

const statusConfig = {
  pending: {
    icon: FaClock,
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    label: 'Pending'
  },
  confirmed: {
    icon: FaCheckCircle,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    label: 'Confirmed'
  },
  shipped: {
    icon: FaTruck,
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    label: 'Shipped'
  },
  delivered: {
    icon: FaBox,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: 'Delivered'
  },
  cancelled: {
    icon: FaTimesCircle,
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    label: 'Cancelled'
  }
};

function StatusSelect({ value, onChange, orderId }: { value: Order['status'], onChange: (status: Order['status']) => void, orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentStatus = statusConfig[value];
  const StatusIcon = currentStatus.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-sm border-2 border-tathir-cream rounded-lg px-3 py-1.5 bg-white 
        focus:outline-none focus:ring-2 focus:ring-tathir-light-green focus:border-tathir-light-green
        hover:border-tathir-light-green transition-colors duration-200 cursor-pointer
        shadow-[1px_1px_0_0_rgba(90,58,43,0.3)] group-hover:shadow-[2px_2px_0_0_rgba(90,58,43,0.3)]
        flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <StatusIcon className={`text-sm ${currentStatus.color}`} />
          <span className={`font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
        </div>
        <FaChevronDown className={`text-xs text-tathir-brown transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: dropdownStyle.width,
            zIndex: 50,
          }}
          className="animate-fade-in"
        >
          <div className="bg-white border-2 border-tathir-cream rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    onChange(status as Order['status']);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-tathir-beige/20
                  transition-colors duration-200 ${value === status ? 'bg-tathir-beige/10' : ''}`}
                >
                  <Icon className={`text-sm ${config.color}`} />
                  <span className={`font-medium ${config.color}`}>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, 'book-orders'),
        where('status', 'in', ['pending', 'confirmed', 'shipped']),
        orderBy('createdAt', 'desc')
      );

      // Set up realtime listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData);
      });

      // Cleanup listener on component unmount
      return () => unsubscribe();
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Confirm if status is cancelled
      if (newStatus === 'cancelled' || newStatus === 'delivered') {
        const confirmed = window.confirm(`Are you sure you want to mark this order as ${newStatus}?`);
        if (!confirmed) return;
      }

      await updateDoc(doc(db, 'book-orders', orderId), {
        status: newStatus
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return `${config.bgColor} ${config.color} ${config.borderColor}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tathir-beige flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <FaSpinner className="animate-spin text-4xl text-tathir-dark-green mx-auto mb-3" />
          <p className="text-sm text-tathir-dark-green">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-tathir-beige rounded-lg min-h-screen">
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="bg-tathir-cream-light rounded-lg border-2 border-tathir-maroon shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.5)] transition-all duration-300">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-tathir-dark-green flex items-center gap-2">
                <FaShoppingCart className="text-xl" />
                Active Orders
              </h1>
              <div className="text-sm text-tathir-brown">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-tathir-cream rounded-lg border-2 border-tathir-maroon p-6 
                  shadow-[4px_4px_0_0_rgba(90,58,43,0.3)] hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.3)] 
                  transition-all duration-300"
                >
                  <div className="flex flex-col items-center justify-between mb-4">
                    <span className="font-mono text-sm text-tathir-dark-gray bg-tathir-beige/20 px-3 py-1 rounded-lg">
                      {order.id}
                    </span>
                    <span className={`${getStatusColor(order.status)} px-3 py-1 rounded-lg text-sm`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-tathir-beige/30 flex items-center justify-center text-tathir-dark-green mr-3">
                        <FaUser className="text-sm" />
                      </div>
                      <span className="text-sm font-medium text-tathir-dark-gray">{order.name}</span>
                    </div>

                    <div className="flex items-center text-sm text-tathir-dark-gray">
                      <FaPhone className="text-sm mr-2 text-tathir-brown" />
                      {order.phone}
                    </div>

                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-sm mr-2 text-tathir-brown mt-1" />
                      <div className="text-sm text-tathir-dark-gray">
                        <div>{order.address}</div>
                        <div className="text-tathir-brown">{order.city}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-tathir-cream">
                      <div className="text-sm font-medium text-tathir-dark-green">
                        ৳ {order.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-tathir-dark-gray">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    <div className="pt-2">
                      <StatusSelect
                        value={order.status}
                        onChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                        orderId={order.id}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="col-span-full text-center py-12 bg-tathir-beige/10 rounded-lg border-2 border-dashed border-tathir-cream">
                  <FaBox className="mx-auto text-3xl text-tathir-brown mb-3 opacity-50" />
                  <p className="text-sm text-tathir-brown">No active orders found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 