"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaClipboardCheck, FaRegClock, FaChalkboardTeacher, FaUserFriends } from 'react-icons/fa';
import { useContext } from 'react';
import { AuthContext } from '@/lib/auth/auth-provider';
import { bloxat } from '@/components/fonts';

const navItems = [
  {
    name: 'Practice Tests',
    href: '/test/practice',
    icon: FaClipboardCheck,
    isPremium: true,
  },
  {
    name: 'Live Tests',
    href: '/test/live',
    icon: FaRegClock,
    isPremium: true,
  },
  {
    name: 'Assessment Tests',
    href: '/test/assessment',
    icon: FaChalkboardTeacher,
    isPremium: false,
  },
  {
    name: 'Challenge Tests',
    href: '/test/challenge',
    icon: FaUserFriends,
    isPremium: true,
  }
];

export default function TestNavigation() {
  const pathname = usePathname();
  const isSubscribed = useContext(AuthContext)?.userProfile?.isSubscribed;

  return (
    <nav className="mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          const isDisabled = item.isPremium && !isSubscribed;
          
          return (
            <Link
              key={item.href}
              href={isDisabled ? "#" : item.href}
              className={`
                relative group transition-all duration-200 rounded-lg p-4 border-2
                ${isActive 
                  ? 'bg-tathir-dark-green border-tathir-dark-green text-tathir-cream' 
                  : 'bg-tathir-cream border-tathir-brown/30 text-tathir-dark-green hover:border-tathir-brown hover:shadow-md'
                }
                ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
                ${bloxat.className}
              `}
              tabIndex={isDisabled ? -1 : 0}
              aria-disabled={isDisabled}
              onClick={isDisabled ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <Icon 
                  className={`text-xl sm:text-2xl transition-transform group-hover:scale-105
                    ${isActive ? 'text-tathir-cream' : 'text-tathir-brown'}
                  `} 
                />
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs sm:text-sm">
                    {item.name}
                  </span>
                  {item.isPremium && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium
                      ${isActive ? 'bg-tathir-maroon text-tathir-cream' : 'bg-tathir-maroon text-tathir-cream'}
                    `}>
                      Pro
                    </span>
                  )}
                </div>
              </div>
              
              {/* Premium lock overlay */}
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-tathir-cream/95 rounded-lg backdrop-blur-sm">
                  <span className="text-xs font-medium text-tathir-maroon px-2 py-1 bg-tathir-beige rounded border border-tathir-maroon">
                    Subscribe
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}