"use client";

import React from 'react';
import Link from 'next/link';
import { FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { bloxat } from '@/components/fonts';

interface ProgressTrackerProps {
  completedTests: number;
  totalTests: number;
  xpPercent: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  completedTests, 
  totalTests, 
  xpPercent 
}) => {
  return (
    <div className="bg-tathir-cream border-2 border-tathir-brown rounded-xl shadow-lg overflow-hidden">
      <div className="bg-tathir-dark-green p-4 flex items-center justify-between">
        <h2 className={`text-xl font-bold text-tathir-cream ${bloxat.className} flex items-center gap-2`}>
          <FaChartLine /> Progress Tracker
        </h2>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-tathir-dark-green mb-2">
            <span>Test Completion</span>
            <span className="font-medium">{xpPercent.toFixed(0)}%</span>
          </div>
          <div className="bg-tathir-brown/20 rounded-full h-4 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-tathir-light-green to-tathir-dark-green h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-tathir-brown">
            {completedTests}/{totalTests} tests completed
          </div>
        </div>
        
        <Link 
          href="/test"
          className="block w-full py-2 bg-tathir-dark-green text-tathir-cream text-center 
                  rounded-lg hover:bg-tathir-brown transition-colors"
        >
          Take Next Test
        </Link>
      </div>
    </div>
  );
};

export default ProgressTracker;
