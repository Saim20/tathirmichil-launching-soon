"use client";

import { useState } from "react";
import { FaClock, FaUser, FaGraduationCap, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaEye, FaTrophy } from "react-icons/fa";
import { UserProfile } from "@/lib/apis/users";
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

interface UserCardProps {
    user: UserWithTestResult;
    onApprovalChange: (userId: string, status: 'accepted' | 'rejected' | 'unsure') => void;
    onViewDetails: (user: UserProfile) => void;
    getApprovalStatusColor: (status: string) => string;
    getApprovalStatusIcon: (status: string) => React.ReactNode;
}

function formatTime(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}

// Component for profile picture with fallback
const ProfilePicture = ({ user }: { user: UserWithTestResult }) => {
    const [imageError, setImageError] = useState(false);

    if (!user.profilePictureUrl || imageError) {
        return (
            <div className="w-8 h-8 rounded-full bg-tathir-beige flex items-center justify-center">
                <FaUser className="text-tathir-brown text-sm" />
            </div>
        );
    }

    return (
        <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
                src={user.profilePictureUrl}
                alt={user.displayName || 'User'}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
            />
        </div>
    );
};

export const UserCard = ({ 
    user, 
    onApprovalChange, 
    onViewDetails, 
    getApprovalStatusColor, 
    getApprovalStatusIcon 
}: UserCardProps) => {
    const approvalStatus = (user as any).approvalStatus || 'unsure';
    
    // Create the user info section
    const userInfo = (
        <div className="flex items-center gap-3 mb-4">
            <ProfilePicture user={user} />
            <div className="min-w-0 flex-1">
                <h3 className="font-medium text-tathir-dark-green truncate">
                    {user.displayName || 'Unknown'}
                </h3>
                <p className="text-sm text-tathir-brown truncate">{user.email}</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getApprovalStatusColor(approvalStatus)}`}>
                {getApprovalStatusIcon(approvalStatus)}
            </div>
        </div>
    );

    // Create the test results section
    const testResults = user.latestTestResult ? (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-tathir-brown">
                <FaGraduationCap />
                <span>Assessment Results</span>
            </div>
            
            {/* Score Display */}
            <div className="space-y-3 p-4 bg-tathir-beige/50 rounded-lg border border-tathir-brown/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaTrophy className="text-tathir-dark-green" />
                        <span className="text-sm font-medium text-tathir-dark-green">Score</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-lg font-bold text-tathir-dark-green ${bloxat.className}`}>
                            {user.latestTestResult.totalCorrect}
                        </span>
                        <span className="text-sm text-tathir-brown/60">
                            / {user.latestTestResult.totalScore || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Accuracy and Time */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-tathir-brown">Accuracy:</span>
                        <span className="font-medium text-tathir-light-green">
                            {user.latestTestResult.accuracy?.toFixed(1) || 0}%
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaClock className="text-tathir-brown" />
                        <span className="font-medium text-tathir-dark-green">
                            {formatTime(user.latestTestResult.timeTaken)}
                        </span>
                    </div>
                </div>

                {/* Category Performance */}
                {user.latestTestResult.categoryScores && Object.keys(user.latestTestResult.categoryScores).length > 0 && (
                    <div className="pt-3 border-t border-tathir-brown/10">
                        <div className="text-xs font-medium text-tathir-brown mb-2">Category Performance</div>
                        <div className="space-y-1">
                            {Object.entries(user.latestTestResult.categoryScores).map(([category, scores]) => {
                                const percentage = scores.totalQuestions > 0 
                                    ? Math.round((scores.correctAnswers / scores.totalQuestions) * 100)
                                    : 0;
                                return (
                                    <div key={category} className="flex justify-between items-center text-xs">
                                        <span className="text-tathir-brown">{category}</span>
                                        <span className="font-medium text-tathir-dark-green">{percentage}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center py-6 text-tathir-brown/60">
            <FaGraduationCap className="text-2xl mb-2" />
            <p className="text-sm">No test results available</p>
        </div>
    );

    // Create the actions section
    const actions = (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => onApprovalChange(user.uid, 'accepted')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                        approvalStatus === 'accepted' 
                            ? 'bg-tathir-light-green text-white' 
                            : 'bg-tathir-beige text-tathir-light-green hover:bg-green-50'
                    }`}
                >
                    Accept
                </button>
                <button
                    onClick={() => onApprovalChange(user.uid, 'rejected')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                        approvalStatus === 'rejected' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-tathir-beige text-red-600 hover:bg-red-50'
                    }`}
                >
                    Reject
                </button>
                <button
                    onClick={() => onApprovalChange(user.uid, 'unsure')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                        approvalStatus === 'unsure' 
                            ? 'bg-tathir-brown text-white' 
                            : 'bg-tathir-beige text-tathir-brown hover:bg-tathir-cream'
                    }`}
                >
                    Unsure
                </button>
            </div>
            
            <button
                onClick={() => onViewDetails(user)}
                className="w-full py-2 px-3 bg-tathir-dark-green text-white rounded-lg text-sm font-medium hover:bg-tathir-maroon transition-colors flex items-center justify-center gap-2"
            >
                <FaEye className="text-xs" />
                <span>View Details</span>
            </button>
        </div>
    );

    const cardContent = (
        <div className="space-y-4">
            {userInfo}
            {testResults}
            {actions}
        </div>
    );

    return (
        <InfoCard
            title=""
            variant="admin"
            className="h-full"
            content={cardContent}
        />
    );
};
