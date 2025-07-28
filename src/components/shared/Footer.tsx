'use client';

import React from 'react';
import { Facebook, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  const links = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/michilofficial',
      icon: <Facebook className="w-5 h-5" />
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/michilofficial',
      icon: <Instagram className="w-5 h-5" />
    },
    {
      name: 'Contact Us',
      href: 'mailto:contact@tathirmichil.com',
      icon: <Mail className="w-5 h-5" />
    }
  ];

  return (
    <footer className="py-8 sm:py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[20rem] sm:w-[35rem] h-[20rem] sm:h-[35rem] bg-tathir-maroon/20 rounded-full blur-3xl -bottom-12 sm:-bottom-24 -right-12 sm:-right-24 animate-pulse"></div>
        <div className="absolute w-[15rem] sm:w-[25rem] h-[15rem] sm:h-[25rem] bg-tathir-brown/20 rounded-full blur-3xl -top-6 sm:-top-12 -left-6 sm:-left-12 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Copyright text with 3D effect */}
        <p className="text-lg sm:text-xl text-tathir-beige jersey-10-regular mb-6 sm:mb-8">
          &copy; 2025 TathirMichil. All rights reserved.
        </p>

        {/* Social links with 3D box style */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-tathir-beige rounded-lg px-4 sm:px-6 py-3 transform hover:scale-[1.02] transition-all duration-300 relative w-full sm:w-auto"
              style={{
                boxShadow: '1px 1px 0 var(--color-tathir-brown), 2px 2px 0 var(--color-tathir-brown), 3px 3px 0 var(--color-tathir-brown), 4px 4px 0 var(--color-tathir-brown), 5px 5px 0 var(--color-tathir-brown), 6px 6px 1px rgba(0,0,0,.1)'
              }}
            >
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="text-tathir-maroon group-hover:text-tathir-brown transition-colors duration-300">
                  {link.icon}
                </div>
                <span className="text-tathir-maroon group-hover:text-tathir-brown transition-colors duration-300 font-medium text-sm sm:text-base">
                  {link.name}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
