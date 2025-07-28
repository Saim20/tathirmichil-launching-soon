"use client";

import { useMemo } from 'react';
import { 
  FaDollarSign, 
  FaCreditCard, 
  FaCheckCircle, 
  FaClock,
  FaTimesCircle,
  FaCalendarAlt 
} from 'react-icons/fa';
import { PaymentData } from '@/hooks/useAllPayments';

interface PaymentStatsCardsProps {
  payments: PaymentData[];
  loading: boolean;
  selectedMonth?: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  activePayments: number;
  pendingPayments: number;
  failedPayments: number;
  currentMonthRevenue: number;
}

export const PaymentStatsCards = ({ payments, loading, selectedMonth }: PaymentStatsCardsProps) => {
  const stats: PaymentStats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    return payments.reduce((acc, payment) => {
      const paymentMonth = payment.createdAt.toISOString().slice(0, 7);
      
      // Total counts
      acc.totalPayments++;
      
      // Status-based counts and revenue
      switch (payment.status) {
        case 'active':
          acc.activePayments++;
          acc.totalRevenue += payment.amount;
          if (paymentMonth === currentMonth) {
            acc.currentMonthRevenue += payment.amount;
          }
          break;
        case 'pending':
          acc.pendingPayments++;
          break;
        case 'failed':
        case 'cancelled':
          acc.failedPayments++;
          break;
      }
      
      return acc;
    }, {
      totalRevenue: 0,
      totalPayments: 0,
      activePayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      currentMonthRevenue: 0,
    });
  }, [payments]);

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    isCurrency = false 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string; 
    isCurrency?: boolean;
  }) => (
    <div className="bg-tathir-beige rounded-xl p-4 sm:p-6 shadow-lg border-2 border-tathir-brown hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-medium text-tathir-maroon">{title}</h3>
        <div className={`text-2xl sm:text-3xl ${color}`}>{icon}</div>
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-tathir-cream rounded"></div>
        </div>
      ) : (
        <p className="text-xl sm:text-2xl font-bold text-tathir-dark-green">
          {isCurrency ? formatCurrency(value) : value}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <StatCard
        title="Total Revenue"
        value={stats.totalRevenue}
        icon={<FaDollarSign />}
        color="text-tathir-light-green"
        isCurrency
      />
      
      <StatCard
        title="Total Payments"
        value={stats.totalPayments}
        icon={<FaCreditCard />}
        color="text-tathir-dark-green"
      />
      
      <StatCard
        title="Active"
        value={stats.activePayments}
        icon={<FaCheckCircle />}
        color="text-tathir-light-green"
      />
      
      <StatCard
        title="Pending"
        value={stats.pendingPayments}
        icon={<FaClock />}
        color="text-yellow-600"
      />
      
      <StatCard
        title="Failed/Cancelled"
        value={stats.failedPayments}
        icon={<FaTimesCircle />}
        color="text-red-600"
      />
      
      <StatCard
        title="This Month"
        value={stats.currentMonthRevenue}
        icon={<FaCalendarAlt />}
        color="text-tathir-maroon"
        isCurrency
      />
    </div>
  );
};
