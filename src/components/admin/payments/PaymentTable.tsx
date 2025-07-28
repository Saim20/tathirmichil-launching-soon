"use client";

import { useState } from 'react';
import { 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaCreditCard,
  FaCheck,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { PaymentData } from '@/hooks/useAllPayments';
import { safeFormatDateTime } from '@/lib/utils/date-utils';

interface PaymentTableProps {
  payments: PaymentData[];
  loading: boolean;
  onUpdateStatus: (paymentId: string, newStatus: string) => Promise<void>;
  updating: boolean;
}

export const PaymentTable = ({ payments, loading, onUpdateStatus, updating }: PaymentTableProps) => {
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'failed': return <FaTimesCircle className="text-red-500" />;
      case 'cancelled': return <FaTimesCircle className="text-gray-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return safeFormatDateTime(date);
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    setUpdatingIds(prev => new Set(prev).add(paymentId));
    try {
      await onUpdateStatus(paymentId, newStatus);
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="bg-tathir-cream rounded-xl p-6 mb-6 shadow-lg border-2 border-tathir-brown">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-tathir-beige rounded"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-tathir-beige rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-tathir-cream rounded-xl p-6 mb-6 shadow-lg border-2 border-tathir-brown">
        <div className="text-center py-12">
          <FaCreditCard className="mx-auto text-6xl text-tathir-brown mb-4" />
          <h3 className="text-lg font-medium text-tathir-maroon mb-2">No payments found</h3>
          <p className="text-tathir-brown">Try adjusting your search or filter criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tathir-cream rounded-xl mb-6 shadow-lg border-2 border-tathir-brown overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-tathir-dark-green text-tathir-cream">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tathir-brown">
            {payments.map((payment, index) => (
              <tr 
                key={payment.id} 
                className={`hover:bg-tathir-beige transition-colors ${
                  index % 2 === 0 ? 'bg-tathir-cream' : 'bg-tathir-beige'
                }`}
              >
                {/* Customer */}
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-tathir-dark-green">
                      {payment.displayName || 'Unknown User'}
                    </div>
                    <div className="text-sm text-tathir-maroon">{payment.email}</div>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FaCreditCard className="text-tathir-dark-green mr-2" />
                    <div>
                      <div className="font-semibold text-tathir-dark-green">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-xs text-tathir-maroon">
                        {payment.subscriptionType || 'Subscription'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    <span className={getStatusBadge(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-sm text-tathir-maroon">
                  {formatDate(payment.createdAt)}
                </td>

                {/* Transaction ID */}
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {payment.transactionId && (
                      <div className="font-mono text-xs bg-tathir-beige px-2 py-1 rounded">
                        {payment.transactionId}
                      </div>
                    )}
                    {payment.paymentId && (
                      <div className="font-mono text-xs bg-tathir-beige px-2 py-1 rounded mt-1">
                        ID: {payment.paymentId}
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  {payment.status === 'pending' && (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(payment.id, 'active')}
                        disabled={updatingIds.has(payment.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        {updatingIds.has(payment.id) ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheck />
                        )}
                        <span className="text-xs">Approve</span>
                      </button>
                      
                      <button
                        onClick={() => handleStatusUpdate(payment.id, 'failed')}
                        disabled={updatingIds.has(payment.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {updatingIds.has(payment.id) ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTimes />
                        )}
                        <span className="text-xs">Reject</span>
                      </button>
                    </div>
                  )}
                  
                  {payment.status !== 'pending' && (
                    <span className="text-sm text-tathir-maroon">
                      {payment.status === 'active' ? 'Approved' : 'Processed'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-tathir-brown">
        {payments.map((payment, index) => (
          <div 
            key={payment.id} 
            className={`p-4 sm:p-6 ${
              index % 2 === 0 ? 'bg-tathir-cream' : 'bg-tathir-beige'
            }`}
          >
            {/* Customer Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="font-medium text-tathir-dark-green text-lg">
                  {payment.displayName || 'Unknown User'}
                </div>
                <div className="text-sm text-tathir-maroon mt-1">{payment.email}</div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {getStatusIcon(payment.status)}
                <span className={getStatusBadge(payment.status)}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-tathir-brown uppercase tracking-wider mb-1">Amount</div>
                <div className="flex items-center">
                  <FaCreditCard className="text-tathir-dark-green mr-2" />
                  <div>
                    <div className="font-semibold text-tathir-dark-green">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-xs text-tathir-maroon">
                      {payment.subscriptionType || 'Subscription'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-tathir-brown uppercase tracking-wider mb-1">Date</div>
                <div className="text-sm text-tathir-maroon">
                  {formatDate(payment.createdAt)}
                </div>
              </div>
            </div>

            {/* Transaction IDs */}
            {(payment.transactionId || payment.paymentId) && (
              <div className="mb-4">
                <div className="text-xs text-tathir-brown uppercase tracking-wider mb-2">Transaction Details</div>
                <div className="space-y-1">
                  {payment.transactionId && (
                    <div className="font-mono text-xs bg-tathir-beige px-2 py-1 rounded break-all">
                      {payment.transactionId}
                    </div>
                  )}
                  {payment.paymentId && (
                    <div className="font-mono text-xs bg-tathir-beige px-2 py-1 rounded break-all">
                      ID: {payment.paymentId}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {payment.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStatusUpdate(payment.id, 'active')}
                  disabled={updatingIds.has(payment.id)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 flex-1"
                >
                  {updatingIds.has(payment.id) ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCheck />
                  )}
                  <span className="text-sm">Approve</span>
                </button>
                
                <button
                  onClick={() => handleStatusUpdate(payment.id, 'failed')}
                  disabled={updatingIds.has(payment.id)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex-1"
                >
                  {updatingIds.has(payment.id) ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTimes />
                  )}
                  <span className="text-sm">Reject</span>
                </button>
              </div>
            )}
            
            {payment.status !== 'pending' && (
              <div className="text-center text-sm text-tathir-maroon py-2">
                {payment.status === 'active' ? 'Approved' : 'Processed'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
