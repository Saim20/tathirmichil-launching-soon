'use client';

import React from 'react';
import { FaTimes, FaExclamationTriangle, FaUserShield, FaUserMinus } from 'react-icons/fa';
import { UserProfile } from '@/lib/apis/users';

interface AdminActionModalProps {
  user: UserProfile;
  action: 'make-admin' | 'remove-admin';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const AdminActionModal: React.FC<AdminActionModalProps> = ({
  user,
  action,
  onConfirm,
  onCancel,
  loading = false
}) => {
  const isMakeAdmin = action === 'make-admin';
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className={`${isMakeAdmin ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'} text-white p-6 rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                {isMakeAdmin ? (
                  <FaUserShield className="text-xl" />
                ) : (
                  <FaUserMinus className="text-xl" />
                )}
              </div>
              <h2 className="text-xl font-bold">
                {isMakeAdmin ? 'Make Admin' : 'Remove Admin'}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              disabled={loading}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="flex items-start gap-3 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <FaExclamationTriangle className="text-yellow-600 text-lg mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">
                {isMakeAdmin ? 'Admin Privileges Warning' : 'Remove Admin Access'}
              </h3>
              <p className="text-sm text-yellow-700">
                {isMakeAdmin ? (
                  'This action will grant full administrative access to this user. They will be able to manage all users, tests, and system settings.'
                ) : (
                  'This action will remove all administrative privileges from this user. They will no longer have access to admin features.'
                )}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">User Details:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {user.displayName || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Current Role:</span> {user.role === 'admin' ? 'Admin' : 'Student'}</p>
              <p><span className="font-medium">Subscription:</span> {user.isSubscribed ? 'Active' : 'Inactive'}</p>
            </div>
          </div>

          {/* Changes Summary */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Changes that will be made:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {isMakeAdmin ? (
                <>
                  <li>• Role will be changed to "Admin"</li>
                  <li>• Subscription status will be set to "Active"</li>
                  <li>• Assessment status will be marked as "Passed"</li>
                  <li>• Full admin dashboard access will be granted</li>
                </>
              ) : (
                <>
                  <li>• Role will be changed to "Student"</li>
                  <li>• Admin dashboard access will be removed</li>
                  <li>• Subscription status will be maintained</li>
                  <li>• User data and progress will be preserved</li>
                </>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                isMakeAdmin
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : (isMakeAdmin ? 'Make Admin' : 'Remove Admin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActionModal;
