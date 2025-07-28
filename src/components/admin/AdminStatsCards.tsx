'use client';

import React from 'react';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserClock, 
  FaCalendarDay,
  FaCalendarWeek,
  FaGraduationCap,
  FaTrophy,
  FaChartLine,
  FaClock,
  FaClipboardCheck,
  FaCoins,
  FaExclamationTriangle,
  FaStar
} from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import { AdminDashboardStats } from '@/hooks/useAdminStats';

interface AdminStatsCardsProps {
  stats: AdminDashboardStats;
  loading: boolean;
}

interface GroupedStatCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  primaryStat: {
    label: string;
    value: string | number;
  };
  secondaryStats: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: string;
  }[];
}

const GroupedStatCard: React.FC<GroupedStatCardProps> = ({ 
  title, 
  icon, 
  color, 
  primaryStat,
  secondaryStats
}) => (
  <div className="bg-tathir-beige rounded-xl p-6 shadow-lg border-2 border-tathir-brown hover:shadow-xl transition-all duration-300">
    {/* Header */}
    <div className="flex items-center gap-3 mb-4">
      <div className={`text-xl ${color}`}>
        {icon}
      </div>
      <h3 className={`text-base font-semibold text-tathir-dark-green ${bloxat.className}`}>
        {title}
      </h3>
    </div>
    
    {/* Primary Stat - Most Important */}
    <div className="mb-6 p-4 bg-tathir-cream rounded-lg border-l-4 border-tathir-dark-green">
      <p className="text-xs uppercase tracking-wide text-tathir-maroon mb-1 font-medium">{primaryStat.label}</p>
      <p className={`text-5xl font-black text-tathir-dark-green ${bloxat.className} leading-none`}>
        {typeof primaryStat.value === 'number' ? primaryStat.value.toLocaleString() : primaryStat.value}
      </p>
    </div>
    
    {/* Secondary Stats - Supporting Information */}
    <div className="space-y-3">
      {secondaryStats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between py-2 border-b border-tathir-brown last:border-b-0">
          <div className="flex items-center gap-2">
            {stat.icon && (
              <span className={stat.color || 'text-tathir-brown'}>
                {stat.icon}
              </span>
            )}
            <p className="text-sm text-tathir-maroon font-medium">{stat.label}</p>
          </div>
          <p className={`text-lg font-bold ${stat.color || 'text-tathir-dark-green'}`}>
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const LoadingCard: React.FC = () => (
  <div className="bg-tathir-beige rounded-xl p-6 shadow-lg border-2 border-tathir-brown">
    <div className="animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-5 bg-tathir-cream rounded"></div>
        <div className="w-32 h-5 bg-tathir-cream rounded"></div>
      </div>
      <div className="mb-6 p-4 bg-tathir-cream rounded-lg border-l-4 border-tathir-brown">
        <div className="w-24 h-3 bg-tathir-brown rounded mb-1"></div>
        <div className="w-20 h-12 bg-tathir-brown rounded"></div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="w-12 h-5 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingCard key={index} />
        ))}
      </div>
    );
  }

  const {
    totalUsers,
    activeUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    subscribedUsers,
    passedUsers,
    adminUsers,
    studentsWithGrades,
    usersWithTests,
    averageAccuracy,
    averageConfidence,
    totalTestsTaken,
    pendingApprovals,
    acceptedUsers,
    rejectedUsers,
    coinStats
  } = stats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* User Demographics */}
      <GroupedStatCard
        title="User Demographics"
        icon={<FaUsers />}
        color="text-blue-500"
        primaryStat={{
          label: "Total Users",
          value: totalUsers
        }}
        secondaryStats={[
          {
            label: "Active Users",
            value: activeUsers,
            icon: <FaUserCheck className="text-xs" />,
            color: "text-green-600"
          },
          {
            label: "Admin Users",
            value: adminUsers,
            icon: <FaStar className="text-xs" />,
            color: "text-red-500"
          },
          {
            label: "New Today",
            value: newUsersToday,
            icon: <FaCalendarDay className="text-xs" />,
            color: "text-purple-500"
          },
          {
            label: "New This Week",
            value: newUsersThisWeek,
            icon: <FaCalendarWeek className="text-xs" />,
            color: "text-orange-500"
          }
        ]}
      />

      {/* Student Progress */}
      <GroupedStatCard
        title="Student Progress"
        icon={<FaGraduationCap />}
        color="text-green-500"
        primaryStat={{
          label: "Subscribed Students",
          value: subscribedUsers
        }}
        secondaryStats={[
          {
            label: "Passed Assessment",
            value: passedUsers,
            icon: <FaTrophy className="text-xs" />,
            color: "text-yellow-500"
          },
          {
            label: "Students with Grades",
            value: studentsWithGrades,
            icon: <FaStar className="text-xs" />,
            color: "text-indigo-500"
          },
          {
            label: "Active Test Takers",
            value: usersWithTests,
            icon: <FaClipboardCheck className="text-xs" />,
            color: "text-blue-600"
          },
          {
            label: "Total Tests Taken",
            value: totalTestsTaken,
            icon: <FaChartLine className="text-xs" />,
            color: "text-purple-600"
          }
        ]}
      />

      {/* Platform Performance & Approvals */}
      <GroupedStatCard
        title="Performance & Approvals"
        icon={<FaChartLine />}
        color="text-tathir-green"
        primaryStat={{
          label: "Average Accuracy",
          value: `${averageAccuracy}%`
        }}
        secondaryStats={[
          {
            label: "Average Attempt Rate",
            value: `${averageConfidence}%`,
            icon: <FaClock className="text-xs" />,
            color: "text-orange-500"
          },
          {
            label: "Pending Approvals",
            value: pendingApprovals,
            icon: <FaExclamationTriangle className="text-xs" />,
            color: "text-yellow-500"
          },
          {
            label: "Accepted Users",
            value: acceptedUsers,
            icon: <FaUserCheck className="text-xs" />,
            color: "text-green-600"
          },
          {
            label: "Rejected Users",
            value: rejectedUsers,
            icon: <FaUserClock className="text-xs" />,
            color: "text-red-500"
          }
        ]}
      />

      {/* Michilcoins Economy */}
      {coinStats && (
        <div className="lg:col-span-2 xl:col-span-3">
          <GroupedStatCard
            title="Michilcoins Economy"
            icon={<FaCoins />}
            color="text-yellow-500"
            primaryStat={{
              label: "Total Circulation",
              value: coinStats.totalCoinsInCirculation.toLocaleString()
            }}
            secondaryStats={[
              {
                label: "Active Earners",
                value: coinStats.totalParticipants,
                icon: <FaUsers className="text-xs" />,
                color: "text-green-500"
              },
              {
                label: "Average Balance",
                value: coinStats.averageCoins,
                icon: <FaChartLine className="text-xs" />,
                color: "text-blue-500"
              },
              {
                label: "Highest Balance",
                value: coinStats.topCoins.toLocaleString(),
                icon: <FaTrophy className="text-xs" />,
                color: "text-yellow-600"
              }
            ]}
          />
        </div>
      )}
    </div>
  );
};
