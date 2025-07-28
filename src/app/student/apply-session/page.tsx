'use client';

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/lib/auth/auth-provider';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { updateUserCoins } from '@/lib/apis/coin-rtdb';
import { FaSpinner, FaMedal, FaUser, FaEnvelope, FaPhone, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import { InfoCard } from '@/components/shared/data/InfoCard';

interface SessionApplication {
  name: string;
  email: string;
  phoneNumber: string;
  details: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  createdAt: Date;
  isDone: boolean;
}

const ApplySessionPage = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const userProfile = authContext?.userProfile;
  const coinBalance = authContext?.coinBalance || 0;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    details: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default values from user profile
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.displayName || '',
        email: userProfile.email || ''
      }));
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to apply for a session');
      return;
    }

    // Check if user has enough coins (let's say 50 coins required)
    const requiredCoins = 50;
    if (coinBalance < requiredCoins) {
      setError(`You need at least ${requiredCoins} Michilcoins to apply for a session. You currently have ${coinBalance} coins.`);
      return;
    }

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.phoneNumber.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionData: Omit<SessionApplication, 'id'> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        details: formData.details.trim(),
        userId: user.uid,
        userDisplayName: userProfile?.displayName || '',
        userEmail: userProfile?.email || '',
        createdAt: new Date(),
        isDone: false
      };

      // Add to sessions collection
      await addDoc(collection(db, 'sessions'), sessionData);

      // Deduct coins using RTDB
      const coinResult = await updateUserCoins(
        user.uid, 
        requiredCoins, 
        'subtract',
        `Session application - ${formData.name}`,
        {
          displayName: userProfile?.displayName || 'Unknown User',
          profilePictureUrl: userProfile?.profilePictureUrl || '',
          batch: userProfile?.batch || ''
        }
      );

      if (!coinResult.success) {
        throw new Error(coinResult.error || 'Failed to process coin transaction');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        details: ''
      });
    } catch (err) {
      console.error('Error submitting session application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (submitted) {
    const successContent = (
      <div className="text-center space-y-4">
        <FaCheckCircle className="text-6xl text-tathir-dark-green mx-auto mb-4" />
        <p className="text-tathir-brown">
          Your session application has been submitted successfully. Tathir Vai will review your request and get back to you soon.
        </p>
        <div className="bg-tathir-beige/50 rounded-lg p-4 border border-tathir-brown/20">
          <p className="text-sm text-tathir-brown">
            <strong>Coins deducted:</strong> 50 Michilcoins
          </p>
          <p className="text-sm text-tathir-brown">
            <strong>Remaining coins:</strong> {coinBalance - 50} Michilcoins
          </p>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-tathir-beige flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <InfoCard
            title="Application Submitted!"
            variant="student"
            content={successContent}
            actions={{
              primary: {
                label: "Apply for Another Session",
                onClick: () => setSubmitted(false)
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tathir-beige p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-3xl md:text-4xl font-bold text-tathir-dark-green mb-4 ${bloxat.className}`}>
            Apply for One-on-One Session
          </h1>
          <p className="text-lg text-tathir-brown">
            Schedule a personalized session with Tathir Vai to get expert guidance
          </p>
        </div>

        {/* Coin Requirements Card */}
        <InfoCard
          title="Session Requirements"
          variant="student"
          icon={<FaMedal className="text-tathir-maroon" />}
          content={
            <div className="flex items-center justify-between">
              <div>
                <p className="text-tathir-brown font-medium">
                  Cost: 50 Michilcoins per session
                </p>
                <p className="text-sm text-tathir-brown/70">
                  Personalized guidance from expert instructor
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <FaMedal className="text-tathir-maroon text-xl" />
                  <span className={`text-2xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                    {coinBalance}
                  </span>
                </div>
                <p className="text-sm text-tathir-brown">Your Balance</p>
              </div>
            </div>
          }
        />

        {/* Application Form */}
        <InfoCard
          title="Application Form"
          variant="student"
          content={
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-tathir-dark-green font-semibold mb-2">
                  <FaUser className="text-tathir-maroon" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:border-tathir-maroon focus:outline-none transition-colors bg-tathir-cream"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-tathir-dark-green font-semibold mb-2">
                  <FaEnvelope className="text-tathir-maroon" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:border-tathir-maroon focus:outline-none transition-colors bg-tathir-cream"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center gap-2 text-tathir-dark-green font-semibold mb-2">
                  <FaPhone className="text-tathir-maroon" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:border-tathir-maroon focus:outline-none transition-colors bg-tathir-cream"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {/* Details */}
              <div>
                <label className="flex items-center gap-2 text-tathir-dark-green font-semibold mb-2">
                  <FaFileAlt className="text-tathir-maroon" />
                  Session Details
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:border-tathir-maroon focus:outline-none transition-colors resize-none bg-tathir-cream"
                  placeholder="Tell us what you'd like to discuss or any specific topics you want to cover..."
                />
              </div>

              {/* Insufficient Coins Warning */}
              {coinBalance < 50 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-700">
                    You need at least 50 Michilcoins to apply for a session. 
                    Take more tests to earn coins!
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || coinBalance < 50}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 border-2 ${bloxat.className} ${
                  loading || coinBalance < 50
                    ? 'bg-tathir-brown/50 text-tathir-cream/70 cursor-not-allowed border-tathir-brown/30'
                    : 'bg-tathir-dark-green text-tathir-cream hover:bg-tathir-brown border-tathir-dark-green hover:border-tathir-brown hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          }
        />
      </div>
    </div>
  );
};

export default ApplySessionPage; 