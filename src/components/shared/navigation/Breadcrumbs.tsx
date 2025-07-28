"use client";

import React from 'react';
import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  showHome?: boolean;
  homeHref?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  variant = 'admin',
  className = "",
  showHome = true,
  homeHref = "/"
}) => {
  const variantStyles = {
    admin: {
      container: 'text-tathir-dark-green',
      link: 'text-tathir-brown hover:text-tathir-dark-green',
      current: 'text-tathir-dark-green',
      separator: 'text-tathir-brown/60'
    },
    student: {
      container: 'text-tathir-dark-green',
      link: 'text-tathir-brown hover:text-tathir-dark-green',
      current: 'text-tathir-dark-green',
      separator: 'text-tathir-brown/60'
    },
    public: {
      container: 'text-tathir-dark-green',
      link: 'text-tathir-brown hover:text-tathir-dark-green',
      current: 'text-tathir-dark-green',
      separator: 'text-tathir-brown/60'
    }
  };

  const styles = variantStyles[variant];

  const allItems = showHome 
    ? [{ label: 'Home', href: homeHref, icon: <FaHome className="w-4 h-4" /> }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={`${styles.container} ${className}`}>
      <ol className="flex items-center space-x-2 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <FaChevronRight className={`w-3 h-3 mx-2 ${styles.separator}`} />
              )}
              
              {item.href && !isLast ? (
                <Link 
                  href={item.href}
                  className={`flex items-center gap-1 transition-colors duration-200 ${styles.link}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className={`flex items-center gap-1 ${isLast ? styles.current : styles.link}`}>
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
