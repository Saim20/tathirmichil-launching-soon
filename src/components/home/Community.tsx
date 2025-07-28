'use client';

import React from 'react';
import { Users, Heart, Image, ChevronRight } from 'lucide-react';
import useInView from '../../lib/utils';

const Community = () => {
  const socialLinks = [
    {
      title: 'Facebook Group',
      description: 'Join our active community',
      icon: <Users className="h-8 w-8" />,
      link: 'https://www.facebook.com/groups/1029982111933925',
      bgColor: 'bg-tathir-maroon'
    },
    {
      title: 'Community Chat',
      description: 'Stay updated with the latest updates',
      icon: <Heart className="h-8 w-8" />,
      link: 'https://m.me/ch/AbYOUOD50UYdOiTv/?send_source=cm:copy_invite_link',
      bgColor: 'bg-tathir-brown'
    },
    {
      title: 'Instagram',
      description: 'Follow our stories',
      icon: <Image className="h-8 w-8" />,
      link: 'https://www.instagram.com/tathirmichil',
      bgColor: 'bg-tathir-maroon'
    }
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6  relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[20rem] sm:w-[35rem] h-[20rem] sm:h-[35rem] bg-tathir-maroon/20 rounded-full blur-3xl -top-12 sm:-top-24 left-0 animate-pulse"></div>
        <div className="absolute w-[15rem] sm:w-[25rem] h-[15rem] sm:h-[25rem] bg-tathir-brown/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse delay-300"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-8 sm:mb-12">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-tathir-maroon via-tathir-brown to-tathir-dark-green opacity-20 blur-lg transform scale-110"></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl uppercase font-bold tracking-wider relative">
                <span className="relative">
                  {/* Main text with bottom-right shadow layers for 3D block effect */}
                  <span className="relative text-tathir-beige 
                    [text-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),1px_1px_3px_rgba(0,0,0,.3),3px_3px_5px_rgba(0,0,0,.2),5px_5px_10px_rgba(0,0,0,.25),8px_8px_10px_rgba(0,0,0,.2),12px_12px_20px_rgba(0,0,0,.15)] sm:[text-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),2px_2px_3px_rgba(0,0,0,.3),6px_6px_5px_rgba(0,0,0,.2),10px_10px_10px_rgba(0,0,0,.25),15px_15px_10px_rgba(0,0,0,.2),20px_20px_20px_rgba(0,0,0,.15)]">
                    Join the Community
                  </span>
                </span>
              </h2>
            </div>
            <div className="relative">
              <p className="text-lg sm:text-xl lg:text-2xl text-white font-medium jersey-10-regular leading-relaxed px-2">
              Connect with the Michil Community across all platforms
              </p>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-tathir-beige to-transparent"></div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {socialLinks.map((platform, idx) => (
              <a
                key={idx}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-tathir-beige rounded-xl p-6 sm:p-8 transform hover:scale-[1.02] transition-all duration-300 relative
                  [box-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1)] sm:[box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`${platform.bgColor} bg-opacity-20 backdrop-blur-sm p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 group-hover:bg-opacity-30 transition-colors duration-300`}>
                    <div className="text-tathir-beige">
                      {platform.icon}
                    </div>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-tathir-maroon uppercase mb-3 sm:mb-4 group-hover:text-tathir-cream-light transition-colors duration-300">
                    {platform.title}
                  </h4>
                  <p className="text-sm sm:text-base text-tathir-brown jersey-10-regular leading-relaxed">
                    {platform.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

// AnimatedSection wrapper with enhanced scroll animation
const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 rotate-0 scale-100' : 'opacity-0 translate-y-12 -rotate-2 scale-95'
      }`}
    >
      {children}
    </div>
  );
};

export default Community;