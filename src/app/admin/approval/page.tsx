"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { collection, doc, getDocs, updateDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaSearch, FaFilter, FaUsers, FaSpinner } from "react-icons/fa";
import { useAllUsers } from "@/hooks/useAllUsers";
import { UserProfile } from "@/lib/apis/users";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";
import { UserCard } from "@/components/admin/UserCard";
import { Pagination } from "@/components/admin/Pagination";
import { InfoCard } from "@/components/shared/data/InfoCard";
import { bloxat } from "@/components/fonts";

interface AssessmentTestResult {
    id: string;
    testId: string;
    userId: string;
    totalScore: number;
    totalCorrect: number;
    timeTaken: number;
    accuracy: number;
    confidence: number;
    submittedAt: Date;
    categoryScores: {
        [key: string]: {
            score: number;
            totalQuestions: number;
            correctAnswers: number;
            time: number;
            attempted: number;
        };
    };
}

interface UserWithTestResult extends UserProfile {
    latestTestResult?: AssessmentTestResult;
}

const ITEMS_PER_PAGE = 12;

const ApprovalPage = () => {
    const { users, loading: usersLoading, error: usersError, updateUserLocal } = useAllUsers();
    
    // Core data state
    const [usersWithTestResults, setUsersWithTestResults] = useState<Map<string, UserWithTestResult>>(new Map());
    const [testResultsLoadingMap, setTestResultsLoadingMap] = useState<Map<string, boolean>>(new Map());
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    
    // UI state
    const [searchTerm, setSearchTerm] = useState("");
    const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'unsure'>('pending');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch test result for a specific user
    const fetchUserTestResult = useCallback(async (user: UserProfile): Promise<UserWithTestResult> => {
        if (testResultsLoadingMap.get(user.uid)) {
            return { ...user };
        }

        setTestResultsLoadingMap(prev => new Map(prev).set(user.uid, true));

        try {
            const resultsQuery = query(
                collection(db, "assessment-test-user-results"),
                where("userId", "==", user.uid),
                orderBy("submittedAt", "desc"),
                limit(1)
            );
            const resultsSnapshot = await getDocs(resultsQuery);
            
            let latestTestResult: AssessmentTestResult | undefined;
            if (!resultsSnapshot.empty) {
                const resultDoc = resultsSnapshot.docs[0];
                const data = resultDoc.data();
                latestTestResult = {
                    id: resultDoc.id,
                    testId: data.testId,
                    userId: data.userId,
                    totalScore: data.totalScore || 0,
                    totalCorrect: data.totalCorrect || 0,
                    timeTaken: data.timeTaken || 0,
                    accuracy: data.accuracy || 0,
                    confidence: data.confidence || 0,
                    submittedAt: data.submittedAt?.toDate() || new Date(),
                    categoryScores: data.categoryScores || {}
                };
            }

            const userWithTestResult: UserWithTestResult = {
                ...user,
                latestTestResult,
                approvalStatus: (user as any).approvalStatus || 'unsure'
            };

            return userWithTestResult;
        } catch (error) {
            console.error(`Error fetching test result for user ${user.uid}:`, error);
            return {
                ...user,
                approvalStatus: (user as any).approvalStatus || 'unsure'
            };
        } finally {
            setTestResultsLoadingMap(prev => {
                const newMap = new Map(prev);
                newMap.delete(user.uid);
                return newMap;
            });
        }
    }, [testResultsLoadingMap]);

    // Filter users who passed the assessment
    const passedUsers = useMemo(() => {
        return users.filter(user => user.isPassed === true);
    }, [users]);

    // Filtered and searched users
    const filteredUsers = useMemo(() => {
        return passedUsers.filter(user => {
            const matchesSearch = !searchTerm || 
                user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const userApprovalStatus = (user as any).approvalStatus || 'unsure';
            const matchesApprovalFilter = approvalFilter === 'all' || 
                userApprovalStatus === approvalFilter ||
                (approvalFilter === 'pending' && (userApprovalStatus === 'unsure' || !userApprovalStatus));
            
            return matchesSearch && matchesApprovalFilter;
        });
    }, [passedUsers, searchTerm, approvalFilter]);

    // Paginated users
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage]);

    // Users with test results for current page
    const currentPageUsersWithResults = useMemo(() => {
        return paginatedUsers.map(user => {
            const userWithResults = usersWithTestResults.get(user.uid);
            if (userWithResults) {
                // Update the user data with latest from users array while keeping test results
                return {
                    ...userWithResults,
                    ...user, // Update with latest user data
                    latestTestResult: userWithResults.latestTestResult // Keep the test results
                };
            }
            return user;
        });
    }, [paginatedUsers, usersWithTestResults, users]);

    // Total pages calculation
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    // Load initial data
    useEffect(() => {
        if (usersLoading || usersError || initialDataLoaded) return;
        
        setInitialDataLoaded(true);
    }, [usersLoading, usersError, initialDataLoaded]);

    // Fetch test results for users on current page
    useEffect(() => {
        if (!initialDataLoaded) return;

        const loadTestResultsForCurrentPage = async () => {
            const usersNeedingTestResults = paginatedUsers.filter(user => 
                !usersWithTestResults.has(user.uid) && !testResultsLoadingMap.get(user.uid)
            );

            if (usersNeedingTestResults.length === 0) return;

            const testResultPromises = usersNeedingTestResults.map(fetchUserTestResult);
            const usersWithResults = await Promise.all(testResultPromises);

            setUsersWithTestResults(prev => {
                const newMap = new Map(prev);
                usersWithResults.forEach(user => {
                    newMap.set(user.uid, user);
                });
                return newMap;
            });
        };

        loadTestResultsForCurrentPage();
    }, [paginatedUsers, usersWithTestResults, testResultsLoadingMap, fetchUserTestResult, initialDataLoaded]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, approvalFilter]);

    const handleApprovalStatusChange = async (userId: string, newStatus: 'accepted' | 'rejected' | 'unsure') => {
        try {
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, {
                approvalStatus: newStatus,
                approvalUpdatedAt: new Date(),
                updatedAt: new Date()
            });

            // Update local state in the hook
            updateUserLocal(userId, { 
                approvalStatus: newStatus,
                approvalUpdatedAt: new Date(),
                updatedAt: new Date()
            } as any);

            // Update local users with test results
            setUsersWithTestResults(prev => {
                const newMap = new Map(prev);
                const existingUser = newMap.get(userId);
                if (existingUser) {
                    newMap.set(userId, {
                        ...existingUser,
                        approvalStatus: newStatus
                    } as any);
                }
                return newMap;
            });

        } catch (error) {
            console.error("Error updating approval status:", error);
            alert("Failed to update approval status. Please try again.");
        }
    };

    const openModal = (user: UserProfile) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedUser(null);
        setShowModal(false);
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'text-tathir-light-green bg-green-50';
            case 'rejected': return 'text-red-600 bg-red-50';
            case 'unsure':
            default: return 'text-tathir-brown bg-tathir-beige';
        }
    };

    const getApprovalStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <FaCheckCircle className="text-tathir-light-green" />;
            case 'rejected': return <FaTimesCircle className="text-red-600" />;
            case 'unsure':
            default: return <FaQuestionCircle className="text-tathir-brown" />;
        }
    };

    if (usersLoading) {
        return (
            <div className="min-h-screen bg-tathir-beige">
                <div className="container mx-auto p-4 sm:p-6">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <InfoCard
                            title="Loading Users"
                            variant="admin"
                            icon={<FaSpinner className="animate-spin text-tathir-dark-green" />}
                            content={
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-tathir-dark-green border-t-transparent mx-auto mb-4"></div>
                                    <p className="text-tathir-brown">Loading user data...</p>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (usersError) {
        return (
            <div className="min-h-screen bg-tathir-beige">
                <div className="container mx-auto p-4 sm:p-6">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <InfoCard
                            title="Error Loading Users"
                            variant="admin"
                            icon={<FaTimesCircle className="text-red-600" />}
                            content={
                                <div className="text-center py-8">
                                    <p className="text-red-600 font-medium mb-4">
                                        {usersError}
                                    </p>
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="px-4 py-2 bg-tathir-dark-green text-white rounded-lg hover:bg-tathir-maroon transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tathir-beige">
            <div className="container mx-auto p-4 sm:p-6 space-y-6">
                {/* Header */}
                <InfoCard
                    title="Student Approval"
                    variant="admin"
                    icon={<FaUsers className="text-tathir-dark-green" />}
                    content={
                        <div className="space-y-4">
                            <p className="text-tathir-brown">
                                Review and approve students who have passed the assessment test
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-tathir-light-green rounded-full"></span>
                                    <span className="text-tathir-brown">Accepted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                    <span className="text-tathir-brown">Rejected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-tathir-brown rounded-full"></span>
                                    <span className="text-tathir-brown">Pending</span>
                                </div>
                            </div>
                        </div>
                    }
                />

                {/* Filters and Search */}
                <InfoCard
                    title="Search & Filter"
                    variant="admin"
                    icon={<FaSearch className="text-tathir-dark-green" />}
                    content={
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-tathir-dark-green mb-2">
                                        Search Students
                                    </label>
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tathir-brown/60" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-tathir-brown/20 rounded-lg focus:ring-2 focus:ring-tathir-dark-green focus:border-tathir-dark-green transition-colors bg-white text-tathir-dark-green placeholder-tathir-brown/60"
                                        />
                                    </div>
                                </div>
                                
                                <div className="sm:w-48">
                                    <label className="block text-sm font-medium text-tathir-dark-green mb-2">
                                        Approval Status
                                    </label>
                                    <div className="relative">
                                        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tathir-brown/60" />
                                        <select
                                            value={approvalFilter}
                                            onChange={(e) => setApprovalFilter(e.target.value as any)}
                                            className="w-full pl-10 pr-4 py-3 border border-tathir-brown/20 rounded-lg focus:ring-2 focus:ring-tathir-dark-green focus:border-tathir-dark-green transition-colors bg-white text-tathir-dark-green"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending Review</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="unsure">Unsure</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm border-t border-tathir-brown/10 pt-4">
                                <div className="text-tathir-brown">
                                    <span className={`font-bold text-tathir-dark-green ${bloxat.className}`}>
                                        {filteredUsers.length}
                                    </span> of {passedUsers.length} passed students
                                </div>
                                <div className="text-tathir-brown/60">
                                    Page {currentPage} of {totalPages}
                                </div>
                            </div>
                        </div>
                    }
                />

                {/* Users Grid */}
                {filteredUsers.length === 0 ? (
                    <InfoCard
                        title="No Students Found"
                        variant="admin"
                        icon={<FaUsers className="text-tathir-brown/60" />}
                        content={
                            <div className="text-center py-8">
                                <p className="text-tathir-brown mb-4">
                                    No students found matching your search criteria.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="px-4 py-2 bg-tathir-beige text-tathir-brown rounded-lg hover:bg-tathir-cream transition-colors text-sm"
                                    >
                                        Clear Search
                                    </button>
                                    <button
                                        onClick={() => setApprovalFilter('all')}
                                        className="px-4 py-2 bg-tathir-beige text-tathir-brown rounded-lg hover:bg-tathir-cream transition-colors text-sm"
                                    >
                                        Show All
                                    </button>
                                </div>
                            </div>
                        }
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                            {currentPageUsersWithResults.map((user) => (
                                <UserCard 
                                    key={user.uid} 
                                    user={user} 
                                    onApprovalChange={handleApprovalStatusChange}
                                    onViewDetails={openModal}
                                    getApprovalStatusColor={getApprovalStatusColor}
                                    getApprovalStatusIcon={getApprovalStatusIcon}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <InfoCard
                                title=""
                                variant="admin"
                                content={
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                        totalItems={filteredUsers.length}
                                    />
                                }
                            />
                        )}
                    </>
                )}

                {/* Modal for user details */}
                {showModal && selectedUser && (
                    <UserDetailsModal 
                        user={selectedUser} 
                        onClose={closeModal}
                        onApprovalChange={handleApprovalStatusChange}
                    />
                )}
            </div>
        </div>
    );
};

export default ApprovalPage;