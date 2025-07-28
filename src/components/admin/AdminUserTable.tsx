"use client";

import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaGraduationCap,
  FaChartLine,
  FaClock,
  FaTrophy,
  FaUserCheck,
  FaUserClock,
  FaQuestion,
  FaCoins,
  FaStar,
  FaEye,
  FaUserShield,
  FaUserMinus,
} from "react-icons/fa";
import { UserProfile } from "@/lib/apis/users";
import { useCoinBalance } from "@/hooks/useCoinBalance";
import { safeFormatDate } from "@/lib/utils/date-utils";
import UserTestResultsModal from "./UserTestResultsModal";
import AdminActionModal from "./AdminActionModal";
import { updateUserRole } from "@/lib/apis/admin-user-management";
import { toast } from "sonner";

interface AdminUserTableProps {
  users: UserProfile[];
  loading?: boolean;
  onUserClick?: (user: UserProfile) => void;
  onRefresh?: () => void;
}

interface UserRowProps {
  user: UserProfile;
  onClick?: () => void;
  onAdminAction?: (
    user: UserProfile,
    action: "make-admin" | "remove-admin"
  ) => void;
}

// Component for coin balance display
const CoinBalance = ({ userId }: { userId: string }) => {
  const { coinBalance, loading, error } = useCoinBalance(userId);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 flex items-center">
        <FaCoins className="text-xs mr-1" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-gray-500 flex items-center">
        <FaCoins className="text-xs mr-1" />
        Error
      </div>
    );
  }

  return (
    <div className="text-lg font-bold text-tathir-maroon flex items-center">
      <FaCoins className="text-sm mr-1" />
      {coinBalance.toLocaleString()}
    </div>
  );
};

// Component for profile picture with fallback
const ProfilePicture = ({ user }: { user: UserProfile }) => {
  const [imageError, setImageError] = useState(false);

  if (!user.profilePictureUrl || imageError) {
    return (
      <div className="w-10 h-10 rounded-full bg-tathir-beige flex items-center justify-center shadow-md ring-2 ring-tathir-cream">
        <FaUser className="text-tathir-maroon text-lg" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden shadow-md ring-2 ring-white ring-opacity-60">
      <img
        src={user.profilePictureUrl}
        alt={user.displayName || "User"}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// Mobile Card Component
const UserCard: React.FC<UserRowProps> = ({ user, onClick, onAdminAction }) => {
  const getStatusBadge = (user: UserProfile) => {
    if (user.role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaUserCheck className="text-xs" />
          Admin
        </span>
      );
    }

    if (user.isSubscribed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaTrophy className="text-xs" />
          Subscribed
        </span>
      );
    }

    if (user.isPassed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaGraduationCap className="text-xs" />
          Passed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <FaUserClock className="text-xs" />
        Student
      </span>
    );
  };

  const getGradeBadge = (grade: string) => {
    const gradeColors: Record<string, string> = {
      "A+": "bg-green-100 text-green-800",
      A: "bg-green-100 text-green-700",
      "A-": "bg-green-100 text-green-600",
      "B+": "bg-blue-100 text-blue-800",
      B: "bg-blue-100 text-blue-700",
      "B-": "bg-blue-100 text-blue-600",
      "C+": "bg-yellow-100 text-yellow-800",
      C: "bg-yellow-100 text-yellow-700",
      "C-": "bg-yellow-100 text-yellow-600",
      D: "bg-orange-100 text-orange-800",
      F: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          gradeColors[grade] || "bg-gray-100 text-gray-800"
        }`}
      >
        <FaStar className="text-xs" />
        {grade}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  return (
    <div
      className="bg-tathir-beige rounded-xl shadow-lg border-2 border-tathir-brown overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="bg-tathir-dark-green text-tathir-cream p-4">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <ProfilePicture user={user} />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate">
                {user.displayName || "Unknown"}
              </h3>
              <p className="text-tathir-light-green text-sm opacity-90 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button className="p-2 rounded-full bg-tathir-maroon flex items-center transition-colors flex-shrink-0">
            <FaEye className="text-tathir-cream text-sm" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {getStatusBadge(user)}
          {user.grade && getGradeBadge(user.grade)}
          {user.approvalStatus && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                user.approvalStatus === "accepted"
                  ? "bg-green-100 text-green-800"
                  : user.approvalStatus === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {user.approvalStatus === "accepted" ? (
                <FaUserCheck className="text-xs" />
              ) : user.approvalStatus === "rejected" ? (
                <FaUserClock className="text-xs" />
              ) : (
                <FaQuestion className="text-xs" />
              )}
              {user.approvalStatus}
            </span>
          )}
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {user.batch && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Batch
              </div>
              <div className="text-sm font-medium text-gray-900">
                {user.batch}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Joined
            </div>
            <div className="text-sm font-medium text-gray-900 flex items-center">
              <FaCalendarAlt className="text-xs mr-1" />
              {safeFormatDate(user.updatedAt)}
            </div>
          </div>

          {user.totalTestsTaken !== undefined && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Total Tests
              </div>
              <div className="text-sm font-medium text-gray-900 flex items-center">
                <FaGraduationCap className="text-xs mr-1" />
                {user.totalTestsTaken} taken
              </div>
            </div>
          )}

          {user.practiceTestsTaken !== undefined && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Practice Tests
              </div>
              <div className="text-sm font-medium text-blue-600 flex items-center">
                <FaClock className="text-xs mr-1" />
                {user.practiceTestsTaken} taken
              </div>
            </div>
          )}

          {user.accuracy !== undefined && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Accuracy
              </div>
              <div className="text-sm font-medium text-gray-900 flex items-center">
                <FaChartLine className="text-xs mr-1" />
                {user.accuracy.toFixed(1)}%
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 col-span-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Coins
            </div>
            <CoinBalance userId={user.uid} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Last active: {safeFormatDate(user.updatedAt)}
          </div>
          <div className="flex space-x-2">
            {user.isPassed && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
            {user.isSubscribed && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            {user.role === "admin" && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
        </div>

        {/* Admin Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          {user.role === "admin" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdminAction?.(user, "remove-admin");
              }}
              className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <FaUserMinus className="text-xs" />
              Remove Admin
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdminAction?.(user, "make-admin");
              }}
              className="flex-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <FaUserShield className="text-xs" />
              Make Admin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const UserRow: React.FC<UserRowProps> = ({ user, onClick, onAdminAction }) => {
  const getStatusBadge = (user: UserProfile) => {
    if (user.role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <FaUserCheck className="text-xs" />
          Admin
        </span>
      );
    }

    if (user.isSubscribed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <FaTrophy className="text-xs" />
          Subscribed
        </span>
      );
    }

    if (user.isPassed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <FaGraduationCap className="text-xs" />
          Passed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-tathir-beige text-tathir-maroon border border-tathir-brown">
        <FaUser className="text-xs" />
        Student
      </span>
    );
  };

  const getApprovalBadge = (status?: string) => {
    if (!status || status === "unsure") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <FaQuestion className="text-xs" />
          Pending
        </span>
      );
    }

    if (status === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <FaUserCheck className="text-xs" />
          Accepted
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <FaUserClock className="text-xs" />
          Rejected
        </span>
      );
    }

    return null;
  };

  const getGradeBadge = (grade?: string) => {
    if (!grade) return null;

    const gradeColors = {
      "A+": "bg-green-100 text-green-800 border-green-200",
      A: "bg-green-100 text-green-700 border-green-200",
      "A-": "bg-green-100 text-green-600 border-green-200",
      "B+": "bg-blue-100 text-blue-800 border-blue-200",
      B: "bg-blue-100 text-blue-700 border-blue-200",
      "B-": "bg-blue-100 text-blue-600 border-blue-200",
      "C+": "bg-yellow-100 text-yellow-800 border-yellow-200",
      C: "bg-yellow-100 text-yellow-700 border-yellow-200",
      "C-": "bg-yellow-100 text-yellow-600 border-yellow-200",
      D: "bg-orange-100 text-orange-800 border-orange-200",
      F: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
          gradeColors[grade as keyof typeof gradeColors] ||
          "bg-tathir-beige text-tathir-maroon border-tathir-brown"
        }`}
      >
        <FaStar className="text-xs" />
        Grade {grade}
      </span>
    );
  };

  return (
    <tr
      className={`hover:bg-tathir-beige transition-colors cursor-pointer border-b border-tathir-brown`}
      onClick={onClick}
    >
      {/* User Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <ProfilePicture user={user} />
          <div>
            <div className="font-medium text-tathir-dark-green">
              {user.displayName || "No Name"}
            </div>
            <div className="text-sm text-tathir-maroon flex items-center gap-1">
              <FaEnvelope className="text-xs" />
              {user.email}
            </div>
          </div>
        </div>
      </td>

      {/* Status & Badges */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {getStatusBadge(user)}
          {getGradeBadge(user.grade)}
        </div>
      </td>

      {/* Test Performance */}
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-1">
            <FaGraduationCap className="text-tathir-dark-green text-xs" />
            <span className="font-medium text-tathir-dark-green">{user.totalTestsTaken || 0}</span>
            <span className="text-tathir-maroon">total</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <FaClock className="text-tathir-green text-xs" />
            <span className="font-medium text-tathir-green">
              {user.practiceTestsTaken || 0}
            </span>
            <span className="text-tathir-maroon text-xs">practice</span>
          </div>
          {user.accuracy && user.accuracy > 0 && (
            <div className="flex items-center gap-2">
              <FaChartLine className="text-tathir-light-green text-xs" />
              <span className="text-tathir-light-green font-medium">
                {Math.round(user.accuracy)}%
              </span>
              <span className="text-tathir-maroon text-xs">accuracy</span>
            </div>
          )}
        </div>
      </td>

      {/* Coins */}
      <td className="px-6 py-4">
        <CoinBalance userId={user.uid} />
      </td>

      {/* Approval Status */}
      <td className="px-6 py-4">{getApprovalBadge(user.approvalStatus)}</td>

      {/* Batch & Join Date */}
      <td className="px-6 py-4">
        <div className="text-sm">
          {user.batch && (
            <div className="font-medium text-tathir-dark-green mb-1">{user.batch}</div>
          )}
          <div className="text-tathir-maroon flex items-center gap-1">
            <FaCalendarAlt className="text-xs" />
            {safeFormatDate(user.updatedAt)}
          </div>
        </div>
      </td>

      {/* Admin Actions */}
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="text-tathir-green hover:text-tathir-dark-green text-sm font-medium flex items-center gap-1"
          >
            <FaEye className="text-xs" />
            View
          </button>

          {user.role === "admin" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdminAction?.(user, "remove-admin");
              }}
              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
            >
              <FaUserMinus className="text-xs" />
              Remove Admin
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdminAction?.(user, "make-admin");
              }}
              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
            >
              <FaUserShield className="text-xs" />
              Make Admin
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const LoadingRow: React.FC = () => (
  <tr className="border-b border-tathir-brown">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-tathir-beige"></div>
        <div>
          <div className="w-32 h-4 bg-tathir-beige rounded mb-2"></div>
          <div className="w-48 h-3 bg-tathir-beige rounded"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="w-20 h-6 bg-tathir-beige rounded animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="animate-pulse">
        <div className="w-16 h-4 bg-tathir-beige rounded mb-2"></div>
        <div className="w-20 h-3 bg-tathir-beige rounded"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="w-20 h-6 bg-tathir-beige rounded animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="animate-pulse">
        <div className="w-24 h-4 bg-tathir-beige rounded mb-2"></div>
        <div className="w-20 h-3 bg-tathir-beige rounded"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="w-20 h-4 bg-tathir-beige rounded animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="w-20 h-4 bg-tathir-beige rounded animate-pulse"></div>
    </td>
  </tr>
);

export const AdminUserTable: React.FC<AdminUserTableProps> = ({
  users,
  loading = false,
  onUserClick,
  onRefresh,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showTestResultsModal, setShowTestResultsModal] = useState(false);
  const [showAdminActionModal, setShowAdminActionModal] = useState(false);
  const [adminAction, setAdminAction] = useState<"make-admin" | "remove-admin">(
    "make-admin"
  );
  const [actionLoading, setActionLoading] = useState(false);

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
    setShowTestResultsModal(true);
    onUserClick?.(user);
  };

  const handleCloseModal = () => {
    setShowTestResultsModal(false);
    setSelectedUser(null);
  };

  const handleAdminAction = (
    user: UserProfile,
    action: "make-admin" | "remove-admin"
  ) => {
    setSelectedUser(user);
    setAdminAction(action);
    setShowAdminActionModal(true);
  };

  const handleConfirmAdminAction = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const result = await updateUserRole(
        selectedUser.uid,
        adminAction === "make-admin" ? "admin" : "student"
      );

      if (result.success) {
        toast.success(
          adminAction === "make-admin"
            ? `${
                selectedUser.displayName || selectedUser.email
              } has been made an admin`
            : `Admin privileges removed from ${
                selectedUser.displayName || selectedUser.email
              }`
        );
        setShowAdminActionModal(false);
        setSelectedUser(null);
        onRefresh?.(); // Refresh the user list
      } else {
        toast.error(result.error || "Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };
  // Loading state for cards
  const LoadingCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-tathir-beige rounded-xl shadow-lg border-2 border-tathir-brown overflow-hidden animate-pulse"
        >
          <div className="bg-tathir-cream h-20"></div>
          <div className="p-4 space-y-3">
            <div className="flex space-x-2">
              <div className="w-16 h-6 bg-tathir-cream rounded"></div>
              <div className="w-12 h-6 bg-tathir-cream rounded"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-tathir-cream rounded-lg p-3">
                <div className="w-12 h-3 bg-tathir-brown rounded mb-2"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="w-12 h-3 bg-gray-200 rounded mb-2"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Card Layout - Hidden on desktop */}
      <div className="block lg:hidden">
        {loading ? (
          <LoadingCards />
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4 text-tathir-maroon">
              <FaUser className="text-6xl" />
              <div className="space-y-2">
                <p className="text-xl font-medium">No users found</p>
                <p className="text-sm">
                  Try adjusting your filters to see more users
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.uid}
                user={user}
                onClick={() => handleUserClick(user)}
                onAdminAction={handleAdminAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table Layout - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto rounded-xl">
        <table className="w-full bg-white border-2 border-tathir-brown">
          <thead className="bg-tathir-dark-green text-tathir-cream">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Performance</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Coins</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Approval</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Batch</th>
              <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tathir-brown bg-tathir-cream">
            {loading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <LoadingRow key={index} />
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-tathir-maroon">
                    <FaUser className="text-4xl" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <UserRow
                  key={user.uid}
                  user={user}
                  onClick={() => handleUserClick(user)}
                  onAdminAction={handleAdminAction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Test Results Modal */}
      {selectedUser && showTestResultsModal && (
        <UserTestResultsModal user={selectedUser} onClose={handleCloseModal} />
      )}

      {/* Admin Action Confirmation Modal */}
      {selectedUser && showAdminActionModal && (
        <AdminActionModal
          user={selectedUser}
          action={adminAction}
          onConfirm={handleConfirmAdminAction}
          onCancel={() => {
            setShowAdminActionModal(false);
            setSelectedUser(null);
          }}
          loading={actionLoading}
        />
      )}
    </>
  );
};
