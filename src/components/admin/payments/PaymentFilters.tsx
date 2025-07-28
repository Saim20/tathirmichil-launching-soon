"use client";

import { FaSearch, FaSync } from 'react-icons/fa';

interface PaymentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  onRefresh: () => void;
  loading: boolean;
  resultsCount: number;
  totalCount: number;
}

export const PaymentFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onRefresh,
  loading,
  resultsCount,
  totalCount,
}: PaymentFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="w-full">
        <label className="block text-sm font-medium text-tathir-maroon mb-2">
          Search Payments
        </label>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tathir-brown" />
          <input
            type="text"
            placeholder="Search by name, email, transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-tathir-brown rounded-lg focus:ring-2 focus:ring-tathir-light-green focus:border-tathir-light-green transition-colors text-sm sm:text-base bg-tathir-beige text-tathir-dark-green"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-tathir-maroon mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border-2 border-tathir-brown rounded-lg focus:ring-2 focus:ring-tathir-light-green focus:border-tathir-light-green transition-colors text-sm sm:text-base bg-tathir-beige text-tathir-dark-green"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Sort Field */}
        <div>
          <label className="block text-sm font-medium text-tathir-maroon mb-2">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 sm:px-4 py-3 border-2 border-tathir-brown rounded-lg focus:ring-2 focus:ring-tathir-light-green focus:border-tathir-light-green transition-colors text-sm sm:text-base bg-tathir-beige text-tathir-dark-green"
          >
            <option value="createdAt">Date</option>
            <option value="amount">Amount</option>
            <option value="displayName">Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-tathir-maroon mb-2">
            Order
          </label>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-full px-3 sm:px-4 py-3 border-2 border-tathir-brown rounded-lg hover:bg-tathir-beige transition-colors text-sm sm:text-base font-medium bg-tathir-beige text-tathir-dark-green"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>

        {/* Refresh Button */}
        <div>
          <label className="block text-sm font-medium text-tathir-maroon mb-2">
            Actions
          </label>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 bg-tathir-dark-green text-tathir-cream rounded-lg hover:bg-tathir-dark-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <FaSync className={`${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t-2 border-tathir-brown gap-2">
        <div className="text-sm text-tathir-dark-green">
          Showing <span className="font-semibold">{resultsCount}</span> of{' '}
          <span className="font-semibold">{totalCount}</span> payments
        </div>
        
        {searchTerm && (
          <div className="text-sm text-tathir-maroon">
            Filtered by: <span className="font-medium">"{searchTerm}"</span>
          </div>
        )}
      </div>
    </div>
  );
};
