"use client";

import React from "react";
import Link from "next/link";

interface EightBitCardLinkProps {
  title: string;
  icon?: React.ReactNode;
  image?: string;
  route: string;
  comingSoon?: boolean;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const EightBitLinkButton: React.FC<EightBitCardLinkProps> = ({
  title,
  icon,
  image,
  route,
  comingSoon = false,
  className = "",
  onClick,
  children,
}) => {
  const CardContent = () => (
    <div className={`relative h-full ${className}`}>
      {/* 8-bit style pixelated shadow */}
      <div
        className={`absolute top-2 left-2 w-full h-full transition-colors duration-300 ${
          comingSoon
            ? "bg-black/50"
            : "bg-black/30 group-hover:bg-black/40"
        }`}
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
      />

      {/* Main pixel art box */}
      <div
        className={`relative backdrop-blur-sm p-8 sm:p-10 h-full flex flex-col justify-center transition-all duration-300 border-4 ${
          comingSoon
            ? "bg-tathir-maroon bg-opacity-60 border-tathir-beige cursor-not-allowed opacity-70"
            : "bg-tathir-maroon group-hover:bg-tathir-brown bg-opacity-90 border-tathir-beige transform group-hover:scale-105 group-hover:-translate-y-1 cursor-pointer"
        }`}
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
          imageRendering: "pixelated",
        }}
        onClick={onClick}
      >
        {/* 8-bit corner details */}
        <div className="absolute top-0 right-0 w-2 h-2 bg-tathir-beige" />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-tathir-beige" />

        {/* Icon container with pixel border */}
        <div className="relative flex flex-col items-center text-center">
          <div
            className={`mb-4 p-3 border-2 transition-colors duration-300 ${
              comingSoon
                ? "bg-tathir-beige/20 border-tathir-beige"
                : "bg-tathir-beige/20 border-tathir-beige group-hover:bg-tathir-beige/30"
            }`}
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
            }}
          >
            <div className="filter drop-shadow-lg text-tathir-beige">
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover"
                />
              ) : (
                icon
              )}
            </div>
          </div>

          {/* 8-bit style text */}
          <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider relative text-tathir-beige">
            <span className="relative z-10">{title}</span>
            {/* Pixelated text shadow */}
            <span
              className="absolute top-0.5 left-0.5 text-black/50 -z-10"
              aria-hidden="true"
            >
              {title}
            </span>
          </h3>

          {/* Coming Soon badge */}
          {comingSoon && (
            <div
              className="mt-2 px-2 py-1 bg-tathir-brown text-tathir-beige text-xs font-bold uppercase tracking-wide border border-tathir-beige"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 2px 100%, 0 calc(100% - 2px))",
              }}
            >
              Coming Soon
            </div>
          )}

          {/* Additional children content */}
          {children}
        </div>

        {/* 8-bit style decorative pixels */}
        <div className="absolute top-2 left-2 w-1 h-1 opacity-60 bg-tathir-beige" />
        <div className="absolute top-4 left-2 w-1 h-1 opacity-40 bg-tathir-beige" />
        <div className="absolute bottom-2 right-2 w-1 h-1 opacity-60 bg-tathir-beige" />
        <div className="absolute bottom-4 right-2 w-1 h-1 opacity-40 bg-tathir-beige" />
      </div>
    </div>
  );

  // If it's coming soon or has onClick handler, render as div
  if (comingSoon || onClick) {
    return (
      <div className="group block h-full">
        <CardContent />
      </div>
    );
  }

  // Otherwise render as Link
  return (
    <Link href={route} className="group block h-full">
      <CardContent />
    </Link>
  );
};

export default EightBitLinkButton;
