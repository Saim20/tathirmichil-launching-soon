"use client";

import { PaymentData } from '@/hooks/useAllPayments';
import { useMemo } from 'react';

interface MonthlyRevenueChartProps {
  payments: PaymentData[];
  loading: boolean;
}

interface MonthlyData {
  month: string;
  revenue: number;
  payments: number;
  displayName: string;
}

export const MonthlyRevenueChart = ({ payments, loading }: MonthlyRevenueChartProps) => {
  const monthlyData: MonthlyData[] = useMemo(() => {
    if (!payments.length) return [];

    // Group payments by month
    const monthlyMap = new Map<string, { revenue: number; payments: number }>();
    
    payments.forEach(payment => {
      const monthKey = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const existing = monthlyMap.get(monthKey) || { revenue: 0, payments: 0 };
      
      existing.payments++;
      if (payment.status === 'active') {
        existing.revenue += payment.amount;
      }
      
      monthlyMap.set(monthKey, existing);
    });

    // Convert to array and sort by month (newest first)
    return Array.from(monthlyMap.entries())
      .map(([month, data]) => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return {
          month,
          revenue: data.revenue,
          payments: data.payments,
          displayName: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        };
      })
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12); // Last 12 months
  }, [payments]);

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="bg-tathir-cream rounded-xl p-6 mb-6 shadow-lg border-2 border-tathir-brown">
        <h3 className="text-lg font-semibold text-tathir-dark-green mb-6">Monthly Revenue Trend</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-20 h-4 bg-tathir-beige rounded"></div>
              <div className="flex-1 h-8 bg-tathir-beige rounded"></div>
              <div className="w-16 h-4 bg-tathir-beige rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!monthlyData.length) {
    return (
      <div className="bg-tathir-cream rounded-xl p-6 mb-6 shadow-lg border-2 border-tathir-brown">
        <h3 className="text-lg font-semibold text-tathir-dark-green mb-6">Monthly Revenue Trend</h3>
        <div className="text-center py-8 text-tathir-maroon">
          <p>No payment data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tathir-cream rounded-xl p-4 sm:p-6 mb-6 shadow-lg border-2 border-tathir-brown">
      <h3 className="text-lg font-semibold text-tathir-dark-green mb-4 sm:mb-6">Monthly Revenue Trend</h3>
      
      <div className="space-y-3 sm:space-y-4">
        {monthlyData.map((data, index) => (
          <div key={data.month} className="flex items-center space-x-2 sm:space-x-4">
            {/* Month */}
            <div className="w-16 sm:w-24 text-xs sm:text-sm font-medium text-tathir-maroon flex-shrink-0">
              {data.displayName.split(' ')[0].slice(0, 3)} {data.displayName.split(' ')[1]}
            </div>
            
            {/* Bar */}
            <div className="flex-1 relative">
              <div className="h-6 sm:h-8 bg-tathir-cream rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-tathir-dark-green rounded-lg transition-all duration-700 ease-out"
                  style={{ 
                    width: `${(data.revenue / maxRevenue) * 100}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                />
              </div>
              
              {/* Revenue text overlay */}
              <div className="absolute inset-0 flex items-center px-2 sm:px-3">
                <span className="text-xs font-medium text-white drop-shadow-md">
                  {data.revenue > 0 ? formatCurrency(data.revenue) : ''}
                </span>
              </div>
            </div>
            
            {/* Payment count */}
            <div className="w-12 sm:w-16 text-xs text-tathir-brown text-right flex-shrink-0">
              <span className="hidden sm:inline">{data.payments} payments</span>
              <span className="sm:hidden">{data.payments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
