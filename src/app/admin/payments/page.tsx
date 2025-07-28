"use client";

import { useState, useMemo } from 'react';
import { FaSpinner, FaCreditCard } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import { Pagination } from '@/components/admin/Pagination';
import { useAllPayments } from '@/hooks/useAllPayments';
import { usePaymentActions } from '@/hooks/usePaymentActions';
import { PaymentStatsCards } from '@/components/admin/payments/PaymentStatsCards';
import { MonthlyRevenueChart } from '@/components/admin/payments/MonthlyRevenueChart';
import { PaymentFilters } from '@/components/admin/payments/PaymentFilters';
import { PaymentTable } from '@/components/admin/payments/PaymentTable';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { PageHeader } from '@/components/admin/PageHeader';
import { ContentContainer } from '@/components/admin/ContentContainer';
import { LoadingState } from '@/components/admin/LoadingState';
import { ErrorState } from '@/components/admin/ErrorState';

const PaymentsPage = () => {
  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const { 
    allPayments, 
    loading, 
    error, 
    refresh, 
    getFilteredPayments, 
    getMonthlyStats 
  } = useAllPayments({ itemsPerPage: 20 });

  const { updatePaymentStatus, updating, error: updateError } = usePaymentActions();

  // Get filtered and paginated data
  const { payments, pagination, allFilteredPayments } = useMemo(() => {
    return getFilteredPayments(searchTerm, statusFilter, sortBy, sortOrder, currentPage);
  }, [getFilteredPayments, searchTerm, statusFilter, sortBy, sortOrder, currentPage]);

  // Get monthly stats for charts
  const monthlyStats = useMemo(() => getMonthlyStats(), [getMonthlyStats]);

  // Handle status updates
  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: string) => {
    const success = await updatePaymentStatus(paymentId, newStatus);
    if (success) {
      await refresh(); // Refresh data after successful update
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filters change
  const handleFilterChange = (filterType: string, value: any) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
      case 'sortOrder':
        setSortOrder(value);
        break;
    }
  };

  // Loading state
  if (loading && allPayments.length === 0) {
    return (
      <LoadingState 
        message="Loading payments data..."
      />
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorState 
        message={error}
        icon={<FaCreditCard />}
        onRetry={refresh}
      />
    );
  }

  return (
    <AdminPageLayout>
      {/* Header */}
      <PageHeader
        title="Payment Management"
        description="Manage subscription payments and track revenue analytics"
      />

      {/* Statistics Cards */}
      <ContentContainer>
        <PaymentStatsCards 
          payments={allFilteredPayments} 
          loading={loading}
        />
      </ContentContainer>

      {/* Monthly Revenue Chart */}
      <MonthlyRevenueChart 
        payments={allPayments} 
        loading={loading}
      />

      {/* Filters */}
      <ContentContainer>
        <PaymentFilters
          searchTerm={searchTerm}
          setSearchTerm={(term) => handleFilterChange('search', term)}
          statusFilter={statusFilter}
          setStatusFilter={(status) => handleFilterChange('status', status)}
          sortBy={sortBy}
          setSortBy={(field) => handleFilterChange('sortBy', field)}
          sortOrder={sortOrder}
          setSortOrder={(order) => handleFilterChange('sortOrder', order)}
          onRefresh={refresh}
          loading={loading}
          resultsCount={allFilteredPayments.length}
          totalCount={allPayments.length}
        />
      </ContentContainer>

      {/* Update Error */}
      {updateError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6 mb-6 shadow-lg">
          <p className="text-red-600 text-sm sm:text-base">{updateError}</p>
        </div>
      )}

      {/* Payments Table */}
      <PaymentTable
        payments={payments}
        loading={loading}
        onUpdateStatus={handleUpdatePaymentStatus}
        updating={!!updating}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={20}
            totalItems={pagination.total}
          />
        </div>
      )}
    </AdminPageLayout>
  );
};

export default PaymentsPage;
