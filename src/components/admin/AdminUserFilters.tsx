'use client';

import React from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaUserCheck,
  FaUserClock,
  FaQuestion,
  FaUsers,
  FaGraduationCap,
  FaUserGraduate
} from 'react-icons/fa';
import { UserProfile } from '@/lib/apis/users';

export interface FilterOptions {
  search: string;
  role: 'all' | 'admin' | 'student';
  subscription: 'all' | 'subscribed' | 'unsubscribed';
  testStatus: 'all' | 'passed' | 'not-passed' | 'no-tests';
  approvalStatus: 'all' | 'accepted' | 'rejected' | 'pending';
  grade: 'all' | 'A' | 'B' | 'C' | 'D' | 'F' | 'no-grade';
}

export interface SortOptions {
  field: keyof UserProfile;
  order: 'asc' | 'desc';
}

interface AdminUserFiltersProps {
  filters: FilterOptions;
  sorting: SortOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sorting: SortOptions) => void;
  totalCount: number;
  filteredCount: number;
  loading?: boolean;
}

export const AdminUserFilters: React.FC<AdminUserFiltersProps> = ({
  filters,
  sorting,
  onFilterChange,
  onSortChange,
  totalCount,
  filteredCount,
  loading = false
}) => {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleFilterUpdate = (key: keyof FilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleSortFieldChange = (field: keyof UserProfile) => {
    if (sorting.field === field) {
      onSortChange({ field, order: sorting.order === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ field, order: 'desc' });
    }
  };

  const getSortIcon = (field: keyof UserProfile) => {
    if (sorting.field !== field) return <FaSort className="opacity-30" />;
    return sorting.order === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role !== 'all') count++;
    if (filters.subscription !== 'all') count++;
    if (filters.testStatus !== 'all') count++;
    if (filters.approvalStatus !== 'all') count++;
    if (filters.grade !== 'all') count++;
    return count;
  };

  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      role: 'all',
      subscription: 'all',
      testStatus: 'all',
      approvalStatus: 'all',
      grade: 'all'
    });
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tathir-brown" />
          <input
            type="text"
            placeholder="Search by name, email, or batch..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-tathir-brown rounded-lg focus:outline-none focus:ring-2 focus:ring-tathir-light-green focus:border-tathir-light-green bg-tathir-beige text-tathir-dark-green"
            disabled={loading}
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-tathir-brown mb-1">Role</label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterUpdate('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tathir-green"
            disabled={loading}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
          </select>
        </div>

        {/* Subscription Filter */}
        <div>
          <label className="block text-sm font-medium text-tathir-brown mb-1">Subscription</label>
          <select
            value={filters.subscription}
            onChange={(e) => handleFilterUpdate('subscription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tathir-green"
            disabled={loading}
          >
            <option value="all">All Users</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>

        {/* Test Status Filter */}
        <div>
          <label className="block text-sm font-medium text-tathir-brown mb-1">Test Status</label>
          <select
            value={filters.testStatus}
            onChange={(e) => handleFilterUpdate('testStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tathir-green"
            disabled={loading}
          >
            <option value="all">All Users</option>
            <option value="passed">Passed Assessment</option>
            <option value="not-passed">Not Passed</option>
            <option value="no-tests">No Tests Taken</option>
          </select>
        </div>

        {/* Approval Status Filter */}
        <div>
          <label className="block text-sm font-medium text-tathir-brown mb-1">Approval</label>
          <select
            value={filters.approvalStatus}
            onChange={(e) => handleFilterUpdate('approvalStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tathir-green"
            disabled={loading}
          >
            <option value="all">All Statuses</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Grade Filter */}
        <div>
          <label className="block text-sm font-medium text-tathir-brown mb-1">Grade</label>
          <select
            value={filters.grade}
            onChange={(e) => handleFilterUpdate('grade', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tathir-green"
            disabled={loading}
          >
            <option value="all">All Grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
            <option value="F">Grade F</option>
            <option value="no-grade">No Grade</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearAllFilters}
            disabled={activeFiltersCount === 0 || loading}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <FaFilter />
            Clear {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-tathir-brown">Sort by:</span>
        
        <button
          onClick={() => handleSortFieldChange('displayName')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
            sorting.field === 'displayName' 
              ? 'bg-tathir-dark-green text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          <FaUsers className="text-xs" />
          Name {getSortIcon('displayName')}
        </button>

        <button
          onClick={() => handleSortFieldChange('email')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
            sorting.field === 'email' 
              ? 'bg-tathir-dark-green text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          Email {getSortIcon('email')}
        </button>

        <button
          onClick={() => handleSortFieldChange('updatedAt')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
            sorting.field === 'updatedAt' 
              ? 'bg-tathir-dark-green text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          Join Date {getSortIcon('updatedAt')}
        </button>

        <button
          onClick={() => handleSortFieldChange('totalTestsTaken')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
            sorting.field === 'totalTestsTaken' 
              ? 'bg-tathir-dark-green text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          <FaGraduationCap className="text-xs" />
          Tests {getSortIcon('totalTestsTaken')}
        </button>

        <button
          onClick={() => handleSortFieldChange('accuracy')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
            sorting.field === 'accuracy' 
              ? 'bg-tathir-dark-green text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          Accuracy {getSortIcon('accuracy')}
        </button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <span>
            Showing <span className="font-medium text-tathir-dark-green">{filteredCount.toLocaleString()}</span> of{' '}
            <span className="font-medium text-tathir-dark-green">{totalCount.toLocaleString()}</span> users
          </span>
          
          {activeFiltersCount > 0 && (
            <span className="flex items-center gap-1 text-tathir-green">
              <FaFilter className="text-xs" />
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
            </span>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-tathir-green">
            <div className="animate-spin w-4 h-4 border-2 border-tathir-green border-t-transparent rounded-full"></div>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};
