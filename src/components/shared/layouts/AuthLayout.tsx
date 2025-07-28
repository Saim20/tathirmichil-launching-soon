"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { bloxat } from '@/components/fonts';
import { Button } from '@/components/shared/ui/Button';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  showBackButton?: boolean;
  backUrl?: string;
  className?: string;
  variant?: 'login' | 'signup' | 'reset';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  backgroundImage = '/login-bg.jpg',
  showBackButton = true,
  backUrl = '/',
  className = "",
  variant = 'login'
}) => {
  return (
    <div className={`min-h-screen bg-tathir-beige flex flex-col lg:flex-row ${className}`}>
      {/* Left Side - Branding/Image */}
      <div 
        className="hidden lg:flex lg:flex-1 relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-tathir-dark-green/80 via-tathir-brown/70 to-tathir-maroon/80" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center text-white p-12">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Tathirmichil" className="h-16 w-auto" />
              <span className={`${bloxat.className} text-3xl font-bold text-tathir-cream`}>
                Tathirmichil
              </span>
            </Link>
          </div>

          {/* Welcome Message */}
          <div className="max-w-md">
            <h1 className={`${bloxat.className} text-4xl font-bold mb-4 text-tathir-cream`}>
              {variant === 'signup' ? 'Join the Community' : 
               variant === 'reset' ? 'Reset Password' : 
               'Welcome Back'}
            </h1>
            <p className="text-lg text-tathir-cream/90 leading-relaxed">
              {variant === 'signup' ? 
                'Start your IBA preparation journey with thousands of other students' :
                variant === 'reset' ?
                'Enter your email to receive password reset instructions' :
                'Continue your IBA preparation journey'
              }
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-tathir-light-green/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-tathir-maroon/20 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center bg-tathir-beige">
        <div className="w-full max-w-md mx-auto px-6 py-8">
          {/* Back Button */}
          {showBackButton && (
            <div className="mb-6">
              <Link href={backUrl}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  className="!px-3 !py-2"
                >
                  Back
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Logo (visible on small screens) */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="Tathirmichil" className="h-10 w-auto" />
              <span className={`${bloxat.className} text-2xl font-bold text-tathir-dark-green`}>
                Tathirmichil
              </span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className={`${bloxat.className} text-3xl font-bold text-tathir-dark-green mb-2`}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-tathir-brown/80 text-sm leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className="bg-tathir-cream border-2 border-tathir-brown rounded-xl shadow-lg p-6">
            {children}
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-tathir-brown/70">
            {variant === 'login' && (
              <div className="space-y-2">
                <p>
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-tathir-dark-green font-medium hover:underline">
                    Sign up here
                  </Link>
                </p>
                <p>
                  <Link href="/reset-password" className="text-tathir-dark-green hover:underline">
                    Forgot your password?
                  </Link>
                </p>
              </div>
            )}
            {variant === 'signup' && (
              <p>
                Already have an account?{' '}
                <Link href="/login" className="text-tathir-dark-green font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            )}
            {variant === 'reset' && (
              <p>
                Remember your password?{' '}
                <Link href="/login" className="text-tathir-dark-green font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
