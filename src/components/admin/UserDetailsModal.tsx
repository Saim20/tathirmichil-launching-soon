"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { PersonalBatchFormData } from "@/lib/models/form";
import { UserProfile } from "@/lib/apis/users";
import { FaUser } from "react-icons/fa";

interface UserDetailsModalProps {
  user: UserProfile;
  onClose: () => void;
  onApprovalChange?: (userId: string, newStatus: 'accepted' | 'rejected' | 'unsure') => void;
}

const okayMatch = [
    'yes',
    'agree',
    'sure',
    'done',
    'always',
    'okay',
    'absolutely',
    'definitely',
    'locked',
] as string[];

// Component for profile picture with fallback
const ProfilePicture = ({
  user,
  size = "large",
}: {
  user: UserProfile;
  size?: "small" | "large";
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses =
    size === "large" ? "w-16 h-16 sm:w-20 sm:h-20" : "w-10 h-10";

  const iconSize = size === "large" ? "text-2xl sm:text-3xl" : "text-lg";

  if (!user.profilePictureUrl || imageError) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-gradient-to-br from-tathir-beige to-tathir-cream flex items-center justify-center shadow-lg ring-4 ring-white ring-opacity-80`}
      >
        <FaUser className={`text-tathir-maroon ${iconSize}`} />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full overflow-hidden shadow-lg ring-4 ring-white ring-opacity-80`}
    >
      <img
        src={user.profilePictureUrl}
        alt={user.displayName || "User"}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export const UserDetailsModal = ({ user, onClose, onApprovalChange }: UserDetailsModalProps) => {
  const [formData, setFormData] = useState<PersonalBatchFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      setError(null);

      try {
        const formQuery = query(
          collection(db, "forms"),
          where("userId", "==", user.uid)
        );
        const formSnapshot = await getDocs(formQuery);

        if (!formSnapshot.empty) {
          const formDocData = formSnapshot.docs[0].data();
          const processedFormData = {
            ...formDocData,
            submittedAt: formDocData.submittedAt?.toDate() || new Date(),
          } as PersonalBatchFormData;
          setFormData(processedFormData);
        } else {
          setFormData(null);
        }
      } catch (err) {
        console.error(`Error fetching form data for user ${user.uid}:`, err);
        setError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [user.uid]);

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex items-center justify-center z-50 p-1 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg sm:rounded-2xl w-full max-w-6xl h-[99vh] sm:h-[95vh] sm:max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200 animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* Enhanced Header with Gradient - Mobile Optimized */}
        <div className="sticky top-0 bg-gradient-to-r from-tathir-maroon to-tathir-dark-green text-white p-3 sm:p-6 z-10 shadow-lg flex-shrink-0">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center space-x-2 sm:space-x-5 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <ProfilePicture user={user} size="large" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-1 sm:border-2 border-white flex items-center justify-center">
                  <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1 leading-tight text-black">
                  {user.displayName}'s Application
                </h2>
                <p className="text-tathir-brown text-xs sm:text-sm lg:text-base opacity-90 flex items-center truncate">
                  <span className="mr-1 sm:mr-2 flex-shrink-0">📧</span>
                  <span className="truncate">{user.email}</span>
                </p>
                {user.batch && (
                  <p className="text-tathir-brown text-xs sm:text-sm opacity-75 flex items-center mt-1">
                    <span className="mr-1 sm:mr-2 flex-shrink-0">🎓</span>
                    <span className="truncate">Batch: {user.batch}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-black hover:text-red-600 text-2xl sm:text-3xl flex-shrink-0 ml-2 sm:ml-4 transition-colors duration-200 hover:scale-110 transform p-1"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Enhanced Content Area - Mobile Optimized */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-6 lg:p-8 bg-gray-50">
            {loading ? (
              <div className="text-center py-12 sm:py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-tathir-maroon border-t-transparent mx-auto"></div>
                  <div className="absolute inset-0 rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-200 mx-auto"></div>
                </div>
                <p className="mt-4 sm:mt-6 text-gray-600 text-base sm:text-lg font-medium">
                  Loading application details...
                </p>
                <p className="mt-2 text-gray-400 text-sm">
                  Please wait while we fetch the data
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-xl sm:text-2xl">⚠️</span>
                </div>
                <p className="text-red-600 text-lg sm:text-xl font-semibold">{error}</p>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">
                  Unable to load the application data
                </p>
              </div>
            ) : formData ? (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Quick Stats Card - Mobile Optimized */}
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-tathir-maroon rounded-full mr-2 sm:mr-3"></span>
                    Application Overview
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    <div className="text-center p-2 sm:p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm sm:text-xl lg:text-2xl font-bold text-blue-600 leading-tight">
                        {formData.submittedAt
                          ? new Date(formData.submittedAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <div className="text-xs text-blue-500 font-medium uppercase tracking-wide mt-1">
                        Submitted
                      </div>
                    </div>
                    <div className="text-center p-2 sm:p-4 bg-green-50 rounded-lg">
                      <div className="text-sm sm:text-xl lg:text-2xl font-bold text-green-600 capitalize leading-tight">
                        {formData.status || "pending"}
                      </div>
                      <div className="text-xs text-green-500 font-medium uppercase tracking-wide mt-1">
                        Status
                      </div>
                    </div>
                    <div className="text-center p-2 sm:p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm sm:text-xl lg:text-2xl font-bold text-purple-600 leading-tight">
                        {formData.hscBatch === "Other"
                          ? formData.hscBatchOther
                          : formData.hscBatch}
                      </div>
                      <div className="text-xs text-purple-500 font-medium uppercase tracking-wide mt-1">
                        HSC Batch
                      </div>
                    </div>
                    <div className="text-center p-2 sm:p-4 bg-orange-50 rounded-lg">
                      <div className="text-sm sm:text-xl lg:text-2xl font-bold text-orange-600 leading-tight">
                        {formData.group}
                      </div>
                      <div className="text-xs text-orange-500 font-medium uppercase tracking-wide mt-1">
                        Group
                      </div>
                    </div>
                  </div>
                </div>
                {/* Basic Information */}
                <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-tathir-maroon mb-4 sm:mb-6 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-tathir-maroon rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm">👤</span>
                    </span>
                    <span className="truncate">Basic Information</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-lg break-words">
                        {formData.fullName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Phone
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base break-words flex items-center">
                        <span className="mr-2">📱</span>
                        {formData.phoneNumber}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Email
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base break-words flex items-center">
                        <span className="mr-2">✉️</span>
                        <span className="truncate">{formData.emailAddress}</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Location
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base break-words flex items-center">
                        <span className="mr-2">📍</span>
                        {formData.location}
                      </p>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Facebook Profile
                      </label>
                      <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border-l-4 border-blue-400">
                        <p className="text-gray-900 font-medium text-sm sm:text-base break-words flex items-center">
                          <span className="mr-2">👥</span>
                          <span className="truncate">{formData.facebookProfile}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Academic Information */}
                <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-tathir-maroon mb-4 sm:mb-6 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-tathir-maroon rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm">🎓</span>
                    </span>
                    <span className="truncate">Academic Information</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        School
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
                        {formData.school}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        College
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
                        {formData.college}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Group
                      </label>
                      <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
                        {formData.group}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        HSC Batch
                      </label>
                      <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                        {formData.hscBatch === "Other"
                          ? formData.hscBatchOther
                          : formData.hscBatch}
                      </div>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Academic Description
                      </label>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-gray-300">
                        <p className="text-gray-900 text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                          {formData.academicDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Personal Questions */}
                <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-tathir-maroon mb-4 sm:mb-6 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-tathir-maroon rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm">💭</span>
                    </span>
                    <span className="truncate">Personal Questions</span>
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {[
                      {
                        label: "Personal Description",
                        value: formData.personalDescription,
                        icon: "🧑",
                      },
                      { label: "Why IBA?", value: formData.whyIBA, icon: "🎯" },
                      {
                        label: "Why applying here?",
                        value: formData.whyApplyingHere,
                        icon: "❓",
                      },
                      {
                        label: "If not IBA?",
                        value: formData.ifNotIBA,
                        icon: "🔄",
                      },
                      {
                        label: "Five Years Vision",
                        value: formData.fiveYearsVision,
                        icon: "🔮",
                      },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <label className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <span className="mr-2">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </label>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 border-l-4 border-tathir-maroon">
                          <p className="text-gray-900 text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Preparation Details */}
                <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-tathir-maroon mb-4 sm:mb-6 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-tathir-maroon rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm">📚</span>
                    </span>
                    <span className="truncate">Preparation Details</span>
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Preparation Timeline
                        </label>
                        <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                          ⏰ {formData.prepTimeline}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Struggling Areas
                        </label>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {formData.strugglingAreas?.length ? (
                            formData.strugglingAreas.map((area, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                              >
                                ⚠️ {area}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 italic text-sm">
                              None specified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Other Platforms
                      </label>
                      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-400">
                        <p className="text-gray-900 text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                          {formData.otherPlatforms}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Admission Plans
                      </label>
                      <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border-l-4 border-purple-400">
                        <p className="text-gray-900 text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                          {formData.admissionPlans}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Commitment */}
                <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-tathir-maroon mb-4 sm:mb-6 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-tathir-maroon rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm">✅</span>
                    </span>
                    <span className="truncate">Commitment</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      {
                        label: "Stable Internet",
                        value: formData.stableInternet,
                        icon: "🌐",
                      },
                      {
                        label: "Video Camera On",
                        value: formData.videoCameraOn,
                        icon: "📹",
                      },
                      {
                        label: "Attend Classes",
                        value: formData.attendClasses,
                        icon: "📚",
                      },
                      {
                        label: "Active Participation",
                        value: formData.activeParticipation,
                        icon: "🙋‍♂️",
                      },
                      {
                        label: "Skip Other Coachings",
                        value: formData.skipOtherCoachings,
                        icon: "🚫",
                      },
                      {
                        label: "Stick Till Exam",
                        value: formData.stickTillExam,
                        icon: "🎯",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="text-center p-3 sm:p-4 rounded-lg border border-gray-200"
                      >
                        <div className="text-xl sm:text-2xl mb-2">{item.icon}</div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                          {item.label}
                        </div>
                        <div
                          className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            okayMatch.some(word =>
                              item.value.toLowerCase().includes(word)
                            )
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {okayMatch.some(word =>
                            item.value.toLowerCase().includes(word)
                          )
                            ? "✓"
                            : "✗"}{" "}
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Reflection */}
                <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-tathir-maroon mb-4 sm:mb-6 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-tathir-maroon rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm">🤔</span>
                    </span>
                    <span className="truncate">Reflection</span>
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <span className="mr-2">💔</span>
                        <span className="truncate">Recent Failure</span>
                      </label>
                      <div className="bg-red-50 rounded-lg p-3 sm:p-4 border-l-4 border-red-400">
                        <p className="text-gray-900 text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                          {formData.recentFailure}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <span className="mr-2">📖</span>
                        <span className="truncate">Last Book/Video/Article</span>
                      </label>
                      <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 border-l-4 border-indigo-400">
                        <p className="text-gray-900 text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                          {formData.lastBookVideoArticle}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Referral & Timing */}
                <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-tathir-maroon mb-4 sm:mb-6 flex items-center">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-tathir-maroon rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm">⏰</span>
                    </span>
                    <span className="truncate">Referral & Timing</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                    <div className="text-center p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-xl sm:text-2xl mb-2">👥</div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Referral
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
                        {formData.referral || "None"}
                      </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-xl sm:text-2xl mb-2">📅</div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Start Date
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
                        {formData.preferredStartDate}
                      </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-sky-50 rounded-lg border border-sky-200">
                      <div className="text-xl sm:text-2xl mb-2">🕐</div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Timing
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base break-words">
                        {formData.preferredTiming}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-3xl">📄</span>
                </div>
                <p className="text-gray-500 text-xl font-medium">
                  No application data available
                </p>
                <p className="text-gray-400 mt-2">
                  This user hasn't submitted their application yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Footer - Mobile Optimized */}
        {onApprovalChange && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => onApprovalChange(user.uid, 'accepted')}
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 ${
                  (user as any).approvalStatus === 'accepted' 
                    ? 'bg-green-600 text-white shadow-lg transform scale-[0.98]' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                }`}
              >
                <span>✓</span>
                <span>Accept</span>
              </button>
              <button
                onClick={() => onApprovalChange(user.uid, 'rejected')}
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 ${
                  (user as any).approvalStatus === 'rejected' 
                    ? 'bg-red-600 text-white shadow-lg transform scale-[0.98]' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md'
                }`}
              >
                <span>✗</span>
                <span>Reject</span>
              </button>
              <button
                onClick={() => onApprovalChange(user.uid, 'unsure')}
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 ${
                  (user as any).approvalStatus === 'unsure' 
                    ? 'bg-yellow-600 text-white shadow-lg transform scale-[0.98]' 
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:shadow-md'
                }`}
              >
                <span>?</span>
                <span>Unsure</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
