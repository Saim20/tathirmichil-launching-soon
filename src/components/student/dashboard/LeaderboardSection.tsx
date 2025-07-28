"use client";

import React from 'react';
import { FaCoins } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import LeaderboardWidget from '@/components/student/LeaderboardWidget';
import AnimatedSection from './AnimatedSection';

const LeaderboardSection: React.FC = () => {
  return (
    <AnimatedSection>
      <div>
        <LeaderboardWidget />
      </div>
    </AnimatedSection>
  );
};

export default LeaderboardSection;
