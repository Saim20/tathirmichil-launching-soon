"use client";

import React from 'react';
import { FaChartLine, FaUserGraduate, FaClock } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import StatBlock from './StatBlock';

interface PerformanceStatsProps {
  accuracy: string;
  confidence: string;
  timePerQuestion: string;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ 
  accuracy, 
  confidence, 
  timePerQuestion 
}) => {
  return (
    <div className="bg-tathir-cream border-2 border-tathir-brown rounded-xl shadow-lg overflow-hidden">
      <div className="bg-tathir-dark-green p-4 flex items-center justify-between">
        <h2 className={`text-xl font-bold text-tathir-cream ${bloxat.className} flex items-center gap-2`}>
          <FaChartLine /> Performance Stats
        </h2>
      </div>
      <div className="p-4 pt-6">
        <div className="grid grid-cols-3 gap-4">
          <StatBlock 
            label="Accuracy" 
            value={accuracy} 
            icon={<FaChartLine className="text-tathir-light-green" />}
          />
          <StatBlock 
            label="Attempt" 
            value={confidence} 
            icon={<FaUserGraduate className="text-tathir-light-green" />}
          />
          <StatBlock 
            label="Avg. Time" 
            value={timePerQuestion} 
            icon={<FaClock className="text-tathir-light-green" />}
          />
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats;
