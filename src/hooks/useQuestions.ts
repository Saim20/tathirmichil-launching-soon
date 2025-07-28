import { useState, useEffect, useCallback, useMemo } from 'react';
import { Question, getAllQuestions } from '@/lib/apis/questions';
import { ComprehensiveQuestion, getAllComprehensiveQuestions } from '@/lib/apis/comprehensive-questions';

interface UseQuestionsOptions {
    searchTerm?: string;
    category?: string;
    subCategory?: string;
    sortBy?: 'title' | 'category' | 'subCategory';
    sortOrder?: 'asc' | 'desc';
    includeComprehensive?: boolean; // New option to include comprehensive questions
}

interface UseQuestionsReturn {
    questions: Question[];
    comprehensiveQuestions: ComprehensiveQuestion[];
    filteredQuestions: Question[];
    filteredComprehensiveQuestions: ComprehensiveQuestion[];
    loading: boolean;
    error: string | null;
    refreshQuestions: () => Promise<void>;
    updateLocalQuestion: (questionId: string, updates: Partial<Question>) => void;
    updateLocalComprehensiveQuestion: (questionId: string, updates: Partial<ComprehensiveQuestion>) => void;
    clearCache: () => void;
    totalCount: number;
    comprehensiveTotalCount: number;
    categories: string[];
    subCategories: string[];
}

const STORAGE_KEY = 'cached_questions';
const COMPREHENSIVE_STORAGE_KEY = 'cached_comprehensive_questions';
const CACHE_EXPIRY_KEY = 'questions_cache_expiry';
const COMPREHENSIVE_CACHE_EXPIRY_KEY = 'comprehensive_questions_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useQuestions(options: UseQuestionsOptions = {}): UseQuestionsReturn {
    const { searchTerm = '', category = '', subCategory = '', sortBy = 'title', sortOrder = 'asc', includeComprehensive = true } = options;
    
    const [questions, setQuestions] = useState<Question[]>([]);
    const [comprehensiveQuestions, setComprehensiveQuestions] = useState<ComprehensiveQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if cache is valid
    const isCacheValid = useCallback((key: string): boolean => {
        try {
            const expiryTime = localStorage.getItem(key);
            if (!expiryTime) return false;
            return Date.now() < parseInt(expiryTime);
        } catch {
            return false;
        }
    }, []);

    // Load questions from cache
    const loadFromCache = useCallback((): Question[] | null => {
        try {
            if (!isCacheValid(CACHE_EXPIRY_KEY)) {
                // Clear expired cache
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(CACHE_EXPIRY_KEY);
                return null;
            }
            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (err) {
            console.error('Failed to load questions from cache:', err);
            return null;
        }
    }, [isCacheValid]);

    // Load comprehensive questions from cache
    const loadComprehensiveFromCache = useCallback((): ComprehensiveQuestion[] | null => {
        try {
            if (!isCacheValid(COMPREHENSIVE_CACHE_EXPIRY_KEY)) {
                // Clear expired cache
                localStorage.removeItem(COMPREHENSIVE_STORAGE_KEY);
                localStorage.removeItem(COMPREHENSIVE_CACHE_EXPIRY_KEY);
                return null;
            }
            const cached = localStorage.getItem(COMPREHENSIVE_STORAGE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (err) {
            console.error('Failed to load comprehensive questions from cache:', err);
            return null;
        }
    }, [isCacheValid]);

    // Save questions to cache
    const saveToCache = useCallback((questionsData: Question[]): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(questionsData));
            localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
        } catch (err) {
            console.error('Failed to save questions to cache:', err);
        }
    }, []);

    // Save comprehensive questions to cache
    const saveComprehensiveToCache = useCallback((comprehensiveQuestionsData: ComprehensiveQuestion[]): void => {
        try {
            localStorage.setItem(COMPREHENSIVE_STORAGE_KEY, JSON.stringify(comprehensiveQuestionsData));
            localStorage.setItem(COMPREHENSIVE_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
        } catch (err) {
            console.error('Failed to save comprehensive questions to cache:', err);
        }
    }, []);

    // Fetch questions from API
    const fetchQuestions = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            // Always fetch regular questions
            const questionsResponse = await getAllQuestions();
            
            if (questionsResponse.success && questionsResponse.data) {
                setQuestions(questionsResponse.data);
                saveToCache(questionsResponse.data);
            } else {
                throw new Error(questionsResponse.error || 'Failed to fetch questions');
            }

            // Fetch comprehensive questions if requested
            if (includeComprehensive) {
                const comprehensiveResponse = await getAllComprehensiveQuestions();
                
                if (comprehensiveResponse.success && comprehensiveResponse.data) {
                    setComprehensiveQuestions(comprehensiveResponse.data);
                    saveComprehensiveToCache(comprehensiveResponse.data);
                } else {
                    throw new Error(comprehensiveResponse.error || 'Failed to fetch comprehensive questions');
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
            setError(errorMessage);
            console.error('Failed to fetch questions:', err);
        } finally {
            setLoading(false);
        }
    }, [includeComprehensive, saveToCache, saveComprehensiveToCache]);

    // Refresh questions (force fetch from API)
    const refreshQuestions = useCallback(async (): Promise<void> => {
        // Clear cache before fetching
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        if (includeComprehensive) {
            localStorage.removeItem(COMPREHENSIVE_STORAGE_KEY);
            localStorage.removeItem(COMPREHENSIVE_CACHE_EXPIRY_KEY);
        }
        await fetchQuestions();
    }, [fetchQuestions, includeComprehensive]);

    // Clear cache
    const clearCache = useCallback((): void => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        localStorage.removeItem(COMPREHENSIVE_STORAGE_KEY);
        localStorage.removeItem(COMPREHENSIVE_CACHE_EXPIRY_KEY);
        setQuestions([]);
        setComprehensiveQuestions([]);
    }, []);

    // Update local question data (optimistic update)
    const updateLocalQuestion = useCallback((questionId: string, updates: Partial<Question>): void => {
        setQuestions(prevQuestions => {
            const updatedQuestions = prevQuestions.map(question => 
                question.id === questionId 
                    ? { ...question, ...updates }
                    : question
            );
            
            // Update cache with new data
            saveToCache(updatedQuestions);
            
            return updatedQuestions;
        });
    }, [saveToCache]);

    // Update local comprehensive question data (optimistic update)
    const updateLocalComprehensiveQuestion = useCallback((questionId: string, updates: Partial<ComprehensiveQuestion>): void => {
        setComprehensiveQuestions(prevQuestions => {
            const updatedQuestions = prevQuestions.map(question => 
                question.id === questionId 
                    ? { ...question, ...updates }
                    : question
            );
            
            // Update cache with new data
            saveComprehensiveToCache(updatedQuestions);
            
            return updatedQuestions;
        });
    }, [saveComprehensiveToCache]);

    // Load questions on mount
    useEffect(() => {
        const cached = loadFromCache();
        if (cached) {
            setQuestions(cached);
        }
        
        if (includeComprehensive) {
            const cachedComprehensive = loadComprehensiveFromCache();
            if (cachedComprehensive) {
                setComprehensiveQuestions(cachedComprehensive);
            }
        }
        
        // Fetch if no cache or if comprehensive questions are requested but not cached
        if (!cached || (includeComprehensive && !loadComprehensiveFromCache())) {
            fetchQuestions();
        }
    }, [loadFromCache, loadComprehensiveFromCache, fetchQuestions, includeComprehensive]);

    // Memoized filtered and sorted questions
    const filteredQuestions = useMemo(() => {
        let result = [...questions];

        // Filter by search term (title, explanation, options, category, subCategory)
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            result = result.filter(question =>
                question.title.toLowerCase().includes(search) ||
                question.explanation.toLowerCase().includes(search) ||
                question.category.toLowerCase().includes(search) ||
                question.subCategory.toLowerCase().includes(search) ||
                question.options.some(option => option.toLowerCase().includes(search))
            );
        }

        // Filter by category
        if (category && category !== 'all') {
            result = result.filter(question => question.category === category);
        }

        // Filter by subCategory
        if (subCategory && subCategory !== 'all') {
            result = result.filter(question => question.subCategory === subCategory);
        }

        // Sort questions
        result.sort((a, b) => {
            let aValue: string;
            let bValue: string;

            switch (sortBy) {
                case 'category':
                    aValue = a.category || '';
                    bValue = b.category || '';
                    break;
                case 'subCategory':
                    aValue = a.subCategory || '';
                    bValue = b.subCategory || '';
                    break;
                case 'title':
                default:
                    aValue = a.title || '';
                    bValue = b.title || '';
                    break;
            }

            const comparison = aValue.localeCompare(bValue);
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [questions, searchTerm, category, subCategory, sortBy, sortOrder]);

    // Memoized filtered and sorted comprehensive questions
    const filteredComprehensiveQuestions = useMemo(() => {
        let result = [...comprehensiveQuestions];

        // Filter by search term (title, description, category, subCategory, questions)
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            result = result.filter(compQuestion =>
                compQuestion.title.toLowerCase().includes(search) ||
                compQuestion.category.toLowerCase().includes(search) ||
                compQuestion.subCategory.toLowerCase().includes(search) ||
                compQuestion.questions.some(q => 
                    q.title.toLowerCase().includes(search) ||
                    q.explanation.toLowerCase().includes(search) ||
                    q.options.some(option => option.toLowerCase().includes(search))
                )
            );
        }

        // Filter by category
        if (category && category !== 'all') {
            result = result.filter(compQuestion => compQuestion.category === category);
        }

        // Filter by subCategory
        if (subCategory && subCategory !== 'all') {
            result = result.filter(compQuestion => compQuestion.subCategory === subCategory);
        }

        // Sort comprehensive questions
        result.sort((a, b) => {
            let aValue: string;
            let bValue: string;

            switch (sortBy) {
                case 'category':
                    aValue = a.category || '';
                    bValue = b.category || '';
                    break;
                case 'subCategory':
                    aValue = a.subCategory || '';
                    bValue = b.subCategory || '';
                    break;
                case 'title':
                default:
                    aValue = a.title || '';
                    bValue = b.title || '';
                    break;
            }

            const comparison = aValue.localeCompare(bValue);
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [comprehensiveQuestions, searchTerm, category, subCategory, sortBy, sortOrder]);

    // Memoized unique categories (from both regular and comprehensive questions)
    const categories = useMemo(() => {
        const regularCategories = questions.map(q => q.category).filter(Boolean);
        const comprehensiveCategories = comprehensiveQuestions.map(q => q.category).filter(Boolean);
        const allCategories = [...regularCategories, ...comprehensiveCategories];
        const uniqueCategories = Array.from(new Set(allCategories));
        return uniqueCategories.sort();
    }, [questions, comprehensiveQuestions]);

    // Memoized unique subcategories (from both regular and comprehensive questions)
    const subCategories = useMemo(() => {
        const regularSubCategories = questions.map(q => q.subCategory).filter(Boolean);
        const comprehensiveSubCategories = comprehensiveQuestions.map(q => q.subCategory).filter(Boolean);
        const allSubCategories = [...regularSubCategories, ...comprehensiveSubCategories];
        const uniqueSubCategories = Array.from(new Set(allSubCategories));
        return uniqueSubCategories.sort();
    }, [questions, comprehensiveQuestions]);

    return {
        questions,
        comprehensiveQuestions,
        filteredQuestions,
        filteredComprehensiveQuestions,
        loading,
        error,
        refreshQuestions,
        updateLocalQuestion,
        updateLocalComprehensiveQuestion,
        clearCache,
        totalCount: questions.length,
        comprehensiveTotalCount: comprehensiveQuestions.length,
        categories,
        subCategories,
    };
}
