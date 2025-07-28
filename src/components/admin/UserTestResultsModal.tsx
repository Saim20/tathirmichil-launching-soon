'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaTrophy, 
  FaClock, 
  FaChartLine, 
  FaCalendarAlt, 
  FaSpinner,
  FaExclamationTriangle,
  FaEye,
  FaMedal
} from 'react-icons/fa';
import { UserProfile } from '@/lib/apis/users';
import { getUserLiveTestHistory, UserLiveTestStats } from '@/lib/apis/user-test-stats';
import { safeFormatDateTime } from '@/lib/utils/date-utils';

interface UserTestResultsModalProps {
  user: UserProfile;
  onClose: () => void;
}

const UserTestResultsModal: React.FC<UserTestResultsModalProps> = ({ user, onClose }) => {
  const [testResults, setTestResults] = useState<UserLiveTestStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getUserLiveTestHistory(user.uid);
        if (response.success && response.data) {
          setTestResults(response.data);
        } else {
          setError(response.error || 'Failed to fetch test results');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching test results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [user.uid]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankDisplay = (rank?: number, percentile?: number) => {
    if (rank && percentile) {
      return `#${rank} (${percentile}th percentile)`;
    } else if (rank) {
      return `Rank #${rank}`;
    } else if (percentile) {
      return `${percentile}th percentile`;
    } else {
      return 'No ranking data';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-lg">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <FaTrophy className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Live Test Results</h2>
                <p className="text-tathir-beige">
                  {user.displayName || user.email} - Last 5 Test Results
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* User Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-tathir-beige p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-tathir-dark-green">
                {user.totalTestsTaken || 0}
              </div>
              <div className="text-sm text-tathir-brown">Total Tests</div>
            </div>
            <div className="bg-tathir-cream p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-tathir-dark-green">
                {user.practiceTestsTaken || 0}
              </div>
              <div className="text-sm text-tathir-brown">Practice Tests</div>
            </div>
            <div className="bg-tathir-beige p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-tathir-dark-green">
                {user.accuracy?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-tathir-brown">Avg Accuracy</div>
            </div>
            <div className="bg-tathir-cream p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-tathir-dark-green">
                {user.confidence?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-tathir-brown">Avg Confidence</div>
            </div>
          </div>

          {/* Test Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FaSpinner className="animate-spin text-4xl text-tathir-dark-green mx-auto mb-4" />
                <p className="text-tathir-brown">Loading test results...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Failed to load test results</p>
                <p className="text-gray-600 text-sm">{error}</p>
              </div>
            </div>
          ) : testResults.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FaEye className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No live test results found</p>
                <p className="text-gray-500 text-sm">This user hasn't taken any live tests yet.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-tathir-dark-green mb-4">
                Recent Live Test Results
              </h3>
              {testResults.map((result, index) => (
                <div
                  key={`${result.testId}-${result.submittedAt.getTime()}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Test Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-tathir-dark-green text-white text-xs px-2 py-1 rounded font-medium">
                          Test #{index + 1}
                        </span>
                        <span className="text-sm text-gray-600">
                          {result.testTitle || `Test ID: ${result.testId}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FaCalendarAlt className="text-xs" />
                        {safeFormatDateTime(result.submittedAt)}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FaChartLine className="text-tathir-dark-green" />
                        <span className={`font-medium ${getPerformanceColor(result.accuracy)}`}>
                          {result.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaTrophy className="text-yellow-500" />
                        <span className="font-medium">
                          {result.totalCorrect}/{result.totalScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClock className="text-blue-500" />
                        <span className="font-medium">
                          {formatDuration(result.timeTaken)}
                        </span>
                      </div>
                      {(result.rank || result.percentile) && (
                        <div className="flex items-center gap-1">
                          <FaMedal className="text-purple-500" />
                          <span className="font-medium">
                            {getRankDisplay(result.rank, result.percentile)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tab Switch Warning */}
                  {(result.tabSwitchCount || 0) > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <FaExclamationTriangle className="inline text-yellow-600 mr-1" />
                      <span className="text-yellow-800">
                        {result.tabSwitchCount || 0} tab switch{(result.tabSwitchCount || 0) > 1 ? 'es' : ''} detected
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTestResultsModal;
