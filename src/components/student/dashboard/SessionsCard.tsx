'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/lib/auth/auth-provider';
import { getSessionsByUser, SessionApplication } from '@/lib/apis/sessions';
import { FaVideo, FaClock, FaCheck, FaSpinner, FaChevronRight } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import Link from 'next/link';

const SessionsCard: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [sessions, setSessions] = useState<SessionApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.uid) return;
      
      try {
        const response = await getSessionsByUser(user.uid);
        if (response.success && response.data) {
          setSessions(response.data);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user?.uid]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const recentSessions = sessions.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-tathir-cream border-2 border-tathir-brown rounded-xl shadow-lg overflow-hidden">
        <div className="bg-tathir-dark-green p-4 flex items-center justify-between">
          <h2 className={`text-xl font-bold text-tathir-cream ${bloxat.className} flex items-center gap-2`}>
            <FaVideo /> My Sessions
          </h2>
        </div>
        <div className="p-6 flex items-center justify-center">
          <FaSpinner className="text-tathir-dark-green text-2xl animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tathir-cream border-2 border-tathir-brown rounded-xl shadow-lg overflow-hidden">
      <div className="bg-tathir-dark-green p-4 flex items-center justify-between">
        <h2 className={`text-xl font-bold text-tathir-cream ${bloxat.className} flex items-center gap-2`}>
          <FaVideo /> My Sessions
        </h2>
        <Link 
          href="/student/apply-session"
          className="text-tathir-light-green hover:text-tathir-cream text-sm flex items-center gap-1 transition-colors"
        >
          Apply <FaChevronRight className="text-xs" />
        </Link>
      </div>
      <div className="p-6">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <FaVideo className="text-4xl text-tathir-brown mx-auto mb-4" />
            <p className="text-tathir-brown mb-4">No sessions yet</p>
            <Link 
              href="/student/apply-session"
              className="inline-block px-4 py-2 bg-tathir-dark-green text-white rounded-lg hover:bg-tathir-brown transition-colors"
            >
              Apply for Session
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  session.isDone
                    ? 'border-green-400 bg-green-50/30'
                    : 'border-yellow-400 bg-yellow-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {session.isDone ? (
                      <FaCheck className="text-green-600" />
                    ) : (
                      <FaClock className="text-yellow-600" />
                    )}
                    <span className={`font-semibold ${
                      session.isDone ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {session.isDone ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <span className="text-sm text-tathir-brown">
                    {formatDate(session.createdAt)}
                  </span>
                </div>
                <p className="text-tathir-dark-green font-medium mb-1">
                  {session.name}
                </p>
                {session.details && (
                  <p className="text-sm text-tathir-brown line-clamp-2">
                    {session.details}
                  </p>
                )}
              </div>
            ))}
            
            {sessions.length > 3 && (
              <div className="text-center pt-2">
                <Link 
                  href="/student/apply-session"
                  className="text-sm text-tathir-light-green hover:text-tathir-cream transition-colors"
                >
                  View all {sessions.length} sessions
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsCard; 