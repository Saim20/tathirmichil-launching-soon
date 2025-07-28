'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { FaSpinner, FaCheck, FaClock, FaUser, FaEnvelope, FaPhone, FaFileAlt, FaCalendar } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';

interface SessionRequest {
  id: string;
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

const SessionsPage = () => {
  const [sessions, setSessions] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const q = query(
      collection(db, 'sessions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsData: SessionRequest[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as SessionRequest[];
      
      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsDone = async (sessionId: string) => {
    setUpdating(sessionId);
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        isDone: true
      });
    } catch (error) {
      console.error('Error marking session as done:', error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'pending') return !session.isDone;
    if (filter === 'completed') return session.isDone;
    return true;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tathir-beige flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-tathir-dark-green animate-spin mx-auto mb-4" />
          <h2 className={`text-2xl font-bold text-tathir-dark-green ${bloxat.className}`}>
            Loading session requests...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tathir-beige p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold text-tathir-dark-green mb-4 ${bloxat.className}`}>
            Session Requests
          </h1>
          <p className="text-lg text-tathir-brown">
            Manage one-on-one session applications from students
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-tathir-maroon">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-2xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                  {sessions.length}
                </h3>
                <p className="text-tathir-brown">Total Requests</p>
              </div>
              <FaCalendar className="text-3xl text-tathir-maroon" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-2xl font-bold text-yellow-600 ${bloxat.className}`}>
                  {sessions.filter(s => !s.isDone).length}
                </h3>
                <p className="text-tathir-brown">Pending</p>
              </div>
              <FaClock className="text-3xl text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-2xl font-bold text-green-600 ${bloxat.className}`}>
                  {sessions.filter(s => s.isDone).length}
                </h3>
                <p className="text-tathir-brown">Completed</p>
              </div>
              <FaCheck className="text-3xl text-green-400" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-tathir-dark-green text-white'
                : 'bg-white text-tathir-dark-green hover:bg-tathir-beige'
            }`}
          >
            All ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-yellow-600 hover:bg-yellow-50'
            }`}
          >
            Pending ({sessions.filter(s => !s.isDone).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-white text-green-600 hover:bg-green-50'
            }`}
          >
            Completed ({sessions.filter(s => s.isDone).length})
          </button>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          {filteredSessions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FaCalendar className="text-6xl text-tathir-beige mx-auto mb-4" />
              <h3 className={`text-xl font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                No session requests found
              </h3>
              <p className="text-tathir-brown">
                {filter === 'all' 
                  ? 'No session requests have been submitted yet.'
                  : filter === 'pending'
                  ? 'No pending session requests.'
                  : 'No completed sessions.'
                }
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 ${
                  session.isDone
                    ? 'border-green-400 bg-green-50/30'
                    : 'border-tathir-maroon hover:shadow-xl'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${
                        session.isDone ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {session.isDone ? (
                          <FaCheck className="text-green-600" />
                        ) : (
                          <FaClock className="text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                          {session.name}
                        </h3>
                        <p className="text-sm text-tathir-brown">
                          Applied on {formatDate(session.createdAt)}
                        </p>
                      </div>
                      <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                        session.isDone
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {session.isDone ? 'Completed' : 'Pending'}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-tathir-maroon" />
                        <span className="text-tathir-brown">{session.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-tathir-maroon" />
                        <span className="text-tathir-brown">{session.phoneNumber}</span>
                      </div>
                    </div>

                    {/* Session Details */}
                    {session.details && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaFileAlt className="text-tathir-maroon" />
                          <span className="font-semibold text-tathir-dark-green">Session Details:</span>
                        </div>
                        <p className="text-tathir-brown bg-tathir-beige/30 rounded-lg p-3">
                          {session.details}
                        </p>
                      </div>
                    )}

                    {/* User Info */}
                    <div className="flex items-center gap-2 text-sm text-tathir-brown">
                      <FaUser className="text-tathir-maroon" />
                      <span>
                        Student: {session.userDisplayName} ({session.userEmail})
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!session.isDone && (
                    <div className="lg:ml-4">
                      <button
                        onClick={() => handleMarkAsDone(session.id)}
                        disabled={updating === session.id}
                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === session.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheck />
                        )}
                        Mark as Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsPage; 