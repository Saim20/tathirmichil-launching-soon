import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export interface PaymentData {
  id: string;
  userId: string;
  displayName?: string;
  email?: string;
  type: 'subscription';
  subscriptionType?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'failed' | 'cancelled';
  transactionId?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationInfo {
  total: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UseAllPaymentsOptions {
  itemsPerPage?: number;
}

// Cache duration: 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;
const ALL_PAYMENTS_CACHE_KEY = 'all_payments_cache';

interface CacheEntry {
  data: PaymentData[];
  timestamp: number;
}

export const useAllPayments = (options: UseAllPaymentsOptions = {}) => {
  const { itemsPerPage = 20 } = options;
  
  const [allPayments, setAllPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache management
  const getCachedData = useCallback((): PaymentData[] | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(ALL_PAYMENTS_CACHE_KEY);
      if (!cached) return null;

      const cacheEntry: CacheEntry = JSON.parse(cached);
      const now = Date.now();
      
      if (now - cacheEntry.timestamp > CACHE_DURATION) {
        localStorage.removeItem(ALL_PAYMENTS_CACHE_KEY);
        return null;
      }

      // Convert date strings back to Date objects
      return cacheEntry.data.map(payment => ({
        ...payment,
        createdAt: new Date(payment.createdAt),
        updatedAt: new Date(payment.updatedAt),
      }));
    } catch (error) {
      console.error('Error reading payments cache:', error);
      localStorage.removeItem(ALL_PAYMENTS_CACHE_KEY);
      return null;
    }
  }, []);

  const setCachedData = useCallback((data: PaymentData[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheEntry: CacheEntry = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(ALL_PAYMENTS_CACHE_KEY, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache payments data:', error);
    }
  }, []);

  // Fetch all payments from Firestore
  const fetchAllPayments = useCallback(async (useCache = true) => {
    // Try cache first
    if (useCache) {
      const cachedData = getCachedData();
      if (cachedData) {
        setAllPayments(cachedData);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'subscriptions'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const paymentsData: PaymentData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        paymentsData.push({
          id: doc.id,
          userId: data.userId || '',
          displayName: data.displayName,
          email: data.email,
          type: 'subscription',
          subscriptionType: data.subscriptionType,
          amount: data.amount || 0,
          currency: data.currency || 'BDT',
          status: data.status || 'pending',
          transactionId: data.transactionId,
          paymentId: data.paymentId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      setAllPayments(paymentsData);
      setCachedData(paymentsData);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch payments data');
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  // Clear cache and refetch
  const refresh = useCallback(async () => {
    localStorage.removeItem(ALL_PAYMENTS_CACHE_KEY);
    await fetchAllPayments(false);
  }, [fetchAllPayments]);

  // Filter and paginate payments
  const getFilteredPayments = useCallback((
    searchTerm: string = '',
    statusFilter: string = 'all',
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    page: number = 1
  ) => {
    let filtered = [...allPayments];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.displayName?.toLowerCase().includes(searchLower) ||
        payment.email?.toLowerCase().includes(searchLower) ||
        payment.transactionId?.toLowerCase().includes(searchLower) ||
        payment.paymentId?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof PaymentData];
      let bValue: any = b[sortBy as keyof PaymentData];

      // Handle date sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPayments = filtered.slice(startIndex, endIndex);

    const pagination: PaginationInfo = {
      total,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return {
      payments: paginatedPayments,
      pagination,
      allFilteredPayments: filtered // For stats calculation
    };
  }, [allPayments, itemsPerPage]);

  // Calculate monthly stats from all payments
  const getMonthlyStats = useCallback(() => {
    if (!allPayments.length) return [];

    const monthlyMap = new Map<string, {
      month: string;
      revenue: number;
      payments: number;
      activePayments: number;
      pendingPayments: number;
      failedPayments: number;
      cancelledPayments: number;
    }>();

    allPayments.forEach(payment => {
      const monthKey = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const existing = monthlyMap.get(monthKey) || {
        month: monthKey,
        revenue: 0,
        payments: 0,
        activePayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        cancelledPayments: 0,
      };

      existing.payments++;

      switch (payment.status) {
        case 'active':
          existing.activePayments++;
          existing.revenue += payment.amount;
          break;
        case 'pending':
          existing.pendingPayments++;
          break;
        case 'failed':
          existing.failedPayments++;
          break;
        case 'cancelled':
          existing.cancelledPayments++;
          break;
      }

      monthlyMap.set(monthKey, existing);
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12); // Last 12 months
  }, [allPayments]);

  // Initial load
  useEffect(() => {
    fetchAllPayments();
  }, [fetchAllPayments]);

  return {
    allPayments,
    loading,
    error,
    refresh,
    getFilteredPayments,
    getMonthlyStats,
  };
};
