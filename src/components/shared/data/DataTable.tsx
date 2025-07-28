"use client";

import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  // Sorting
  sortField?: keyof T;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: keyof T, order: 'asc' | 'desc') => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  // Selection
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
  // Empty state
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  loading = false,
  error,
  variant = 'admin',
  className = "",
  sortField,
  sortOrder,
  onSort,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  emptyTitle = "No data available",
  emptyDescription = "There are no items to display at the moment.",
  emptyIcon
}: DataTableProps<T>) {
  const [localSelectedRows, setLocalSelectedRows] = useState<T[]>(selectedRows);

  const variantStyles = {
    admin: {
      container: 'bg-tathir-dark-green border-tathir-maroon text-tathir-cream',
      header: 'bg-tathir-maroon/30 text-tathir-cream border-tathir-maroon',
      row: 'border-tathir-maroon/20 hover:bg-tathir-light-green/10',
      selectedRow: 'bg-tathir-light-green/20',
      sortIcon: 'text-tathir-light-green',
      pagination: 'text-tathir-cream'
    },
    student: {
      container: 'bg-tathir-dark-green border-tathir-maroon text-tathir-cream',
      header: 'bg-tathir-maroon/30 text-tathir-cream border-tathir-maroon',
      row: 'border-tathir-maroon/20 hover:bg-tathir-light-green/10',
      selectedRow: 'bg-tathir-light-green/20',
      sortIcon: 'text-tathir-light-green',
      pagination: 'text-tathir-cream'
    },
    public: {
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      header: 'bg-tathir-brown/20 text-tathir-dark-green border-tathir-brown',
      row: 'border-tathir-brown/20 hover:bg-tathir-dark-green/10',
      selectedRow: 'bg-tathir-dark-green/20',
      sortIcon: 'text-tathir-dark-green',
      pagination: 'text-tathir-dark-green'
    }
  };

  const styles = variantStyles[variant];

  const handleSort = (field: keyof T) => {
    if (!onSort) return;
    
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const handleRowSelection = (row: T, isSelected: boolean) => {
    const newSelection = isSelected 
      ? [...localSelectedRows, row]
      : localSelectedRows.filter(selectedRow => selectedRow.id !== row.id);
    
    setLocalSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = (isSelected: boolean) => {
    const newSelection = isSelected ? [...data] : [];
    setLocalSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const isRowSelected = (row: T) => {
    return localSelectedRows.some(selectedRow => selectedRow.id === row.id);
  };

  const getSortIcon = (field: keyof T) => {
    if (sortField !== field) return <FaSort className={`w-3 h-3 ${styles.sortIcon} opacity-40`} />;
    if (sortOrder === 'asc') return <FaSortUp className={`w-3 h-3 ${styles.sortIcon}`} />;
    return <FaSortDown className={`w-3 h-3 ${styles.sortIcon}`} />;
  };

  if (loading) {
    return (
      <div className={`${styles.container} rounded-xl border-2 sm:border-4 p-8 ${className}`}>
        <LoadingSpinner variant={variant} size="lg" text="Loading data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} rounded-xl border-2 sm:border-4 p-8 ${className}`}>
        <EmptyState
          title="Error loading data"
          description={error}
          variant={variant}
          icon={<span className="text-4xl">⚠️</span>}
        />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`${styles.container} rounded-xl border-2 sm:border-4 p-8 ${className}`}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          variant={variant}
          icon={emptyIcon}
        />
      </div>
    );
  }

  const allSelected = data.length > 0 && localSelectedRows.length === data.length;
  const someSelected = localSelectedRows.length > 0 && localSelectedRows.length < data.length;

  return (
    <div className={`${styles.container} rounded-xl border-2 sm:border-4 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${styles.header} border-b-2`}>
              {selectable && (
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-current"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`p-3 font-bold ${bloxat.className} ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <span>{column.header}</span>
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const isSelected = isRowSelected(row);
              return (
                <tr
                  key={row.id || index}
                  className={`
                    border-b transition-colors duration-200
                    ${styles.row}
                    ${isSelected ? styles.selectedRow : ''}
                  `}
                >
                  {selectable && (
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelection(row, e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-current"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`p-3 ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')
                      }
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className={`flex items-center justify-between p-4 border-t-2 ${styles.header} ${styles.pagination}`}>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              icon={<FaChevronLeft className="w-3 h-3" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              icon={<FaChevronRight className="w-3 h-3" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
