"use client";

import React from 'react';
import Link from 'next/link';
import { FaBookOpen, FaChevronRight } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';

interface Grade {
  week: number;
  grade: string;
}

interface GradesCardProps {
  weeklyGrades: Grade[];
}

const GradesCard: React.FC<GradesCardProps> = ({ weeklyGrades }) => {
  return (
    <div className="bg-tathir-cream border-2 border-tathir-brown rounded-xl shadow-lg overflow-hidden">
      <div className="bg-tathir-dark-green p-4 flex items-center justify-between">
        <h2 className={`text-xl font-bold text-tathir-cream ${bloxat.className} flex items-center gap-2`}>
          <FaBookOpen /> Recent Grades
        </h2>
      </div>
      <div className="p-4 pt-6">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {weeklyGrades.map((item) => (
            <div
              key={item.week}
              className="group flex flex-col items-center"
            >
              <div 
                className={`w-12 h-12 flex items-center justify-center rounded-lg
                  ${item.grade === 'A' ? 'bg-green-500' : 
                    item.grade === 'B' ? 'bg-yellow-500' : 
                    item.grade === 'C' ? 'bg-orange-500' : 'bg-red-500'}
                  transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
              >
                <span className={`text-2xl font-bold text-white ${bloxat.className}`}>
                  {item.grade}
                </span>
              </div>
              <span className="text-xs text-tathir-brown mt-1">Week {item.week}</span>
            </div>
          ))}
        </div>
        
        <Link 
          href="/student/grades"
          className="mt-6 text-sm text-tathir-dark-green hover:text-tathir-brown flex items-center justify-center gap-1 transition-colors"
        >
          View all grades <FaChevronRight className="text-xs" />
        </Link>
      </div>
    </div>
  );
};

export default GradesCard;
