"use client";

import React, { useState, useMemo } from "react";
import { FaSpinner, FaUser, FaChartLine } from "react-icons/fa";
import { bloxat } from "@/components/fonts";
import { Pagination } from "@/components/admin/Pagination";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useDebounce } from "@/hooks/usePerformance";
import { UserProfile } from "@/lib/apis/users";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import {
  AdminUserFilters,
  FilterOptions,
  SortOptions,
} from "@/components/admin/AdminUserFilters";
import { AdminUserTable } from "@/components/admin/AdminUserTable";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { ContentContainer } from "@/components/admin/ContentContainer";
import { LoadingState } from "@/components/admin/LoadingState";
import { ErrorState } from "@/components/admin/ErrorState";

const ITEMS_PER_PAGE = 20;

const AdminDashboard = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    role: "all",
    subscription: "all",
    testStatus: "all",
    approvalStatus: "all",
    grade: "all",
  });
  const [sorting, setSorting] = useState<SortOptions>({
    field: "updatedAt",
    order: "desc",
  });

  // Hooks
  const {
    users,
    loading: usersLoading,
    error: usersError,
    refresh,
  } = useAllUsers();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useAdminStats(users);

  // Debounce search to reduce unnecessary filtering
  const debouncedSearchTerm = useDebounce(filters.search, 300);

  // Filter and sort users
  const { filteredUsers, pagination } = useMemo(() => {
    if (!users.length) {
      return {
        filteredUsers: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          total: 0,
        },
      };
    }

    // Apply filters
    let filtered = users.filter((user) => {
      // Search filter (use debounced search term)
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch =
          user.displayName?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.batch?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Role filter
      if (filters.role !== "all") {
        if (filters.role === "admin" && user.role !== "admin") return false;
        if (filters.role === "student" && user.role === "admin") return false;
      }

      // Subscription filter
      if (filters.subscription !== "all") {
        if (filters.subscription === "subscribed" && !user.isSubscribed)
          return false;
        if (filters.subscription === "unsubscribed" && user.isSubscribed)
          return false;
      }

      // Test status filter
      if (filters.testStatus !== "all") {
        if (filters.testStatus === "passed" && !user.isPassed) return false;
        if (
          filters.testStatus === "not-passed" &&
          (user.isPassed || !user.totalTestsTaken)
        )
          return false;
        if (
          filters.testStatus === "no-tests" &&
          user.totalTestsTaken &&
          user.totalTestsTaken > 0
        )
          return false;
      }

      // Approval status filter
      if (filters.approvalStatus !== "all") {
        const approvalStatus = user.approvalStatus || "pending";
        if (
          filters.approvalStatus === "pending" &&
          approvalStatus !== "unsure" &&
          approvalStatus !== "pending"
        )
          return false;
        if (
          filters.approvalStatus !== "pending" &&
          approvalStatus !== filters.approvalStatus
        )
          return false;
      }

      // Grade filter
      if (filters.grade !== "all") {
        if (filters.grade === "no-grade" && user.grade) return false;
        if (filters.grade !== "no-grade" && user.grade !== filters.grade)
          return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const field = sorting.field;
      let aValue = a[field];
      let bValue = b[field];

      // Handle undefined/null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sorting.order === "asc" ? -1 : 1;
      if (bValue == null) return sorting.order === "asc" ? 1 : -1;

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sorting.order === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Handle number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sorting.order === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Default string comparison
      if (aValue < bValue) return sorting.order === "asc" ? -1 : 1;
      if (aValue > bValue) return sorting.order === "asc" ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const totalUsers = filtered.length;
    const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedUsers = filtered.slice(startIndex, endIndex);

    return {
      filteredUsers: paginatedUsers,
      pagination: {
        currentPage,
        totalPages,
        total: totalUsers,
      },
    };
  }, [users, filters, sorting, currentPage, debouncedSearchTerm]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort changes
  const handleSortChange = (newSorting: SortOptions) => {
    setSorting(newSorting);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state
  if (usersLoading && users.length === 0) {
    return <LoadingState message="Loading admin dashboard..." />;
  }

  // Error state
  if (usersError) {
    return (
      <ErrorState message={usersError} icon={<FaUser />} onRetry={refresh} />
    );
  }

  return (
    <AdminPageLayout>
      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        description="Comprehensive user management and platform analytics"
      />

      {/* Statistics Cards */}
      {stats && (
        <ContentContainer>
          <AdminStatsCards stats={stats} loading={statsLoading} />
        </ContentContainer>
      )}

      {/* Filters and Controls */}
      <ContentContainer>
        <AdminUserFilters
          filters={filters}
          sorting={sorting}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          totalCount={users.length}
          filteredCount={pagination.total}
          loading={usersLoading}
        />
      </ContentContainer>

      {/* Users Table */}
      <AdminUserTable
        users={filteredUsers}
        loading={usersLoading}
        onRefresh={refresh}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mb-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={pagination.total}
          />
        </div>
      )}

      {/* Stats Error */}
      {statsError && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 shadow-lg">
          <p className="text-sm sm:text-base text-yellow-800">
            <FaChartLine className="inline mr-2" />
            Statistics temporarily unavailable: {statsError}
          </p>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminDashboard;
