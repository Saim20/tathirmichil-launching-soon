"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Target,
  Users,
  ScrollText,
  Sparkles,
  BookMarked,
  Mail,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";
import { AuthContext } from "@/lib/auth/auth-provider";

interface NavbarProps {
  transparent?: boolean;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false, className = "" }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useContext(AuthContext)!;

  const navItems = [
    { href: "/blogs", text: "Blogs", icon: <Sparkles className="h-4 w-4" /> },
    { href: "/book", text: "IBA Book", icon: <BookOpen className="h-4 w-4" /> },
    {
      href: "/batch",
      text: "Personal Batch",
      icon: <ScrollText className="h-4 w-4" />,
    },
    { href: "/classes", text: "Classes", icon: <Users className="h-4 w-4" /> },
    ...(user
      ? [
          {
            href: "/test",
            text: "Tests",
            icon: <Target className="h-4 w-4" />,
          },
          {
            href: "/student",
            text: "Dashboard",
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
        ]
      : []),
  ];

  return (
    <nav className={`fixed top-0 z-50 w-full ${transparent ? 'bg-tathir-maroon/50' : 'bg-tathir-dark-green'} ${transparent ? 'backdrop-blur-lg' : ''} text-tathir-beige shadow-lg ${className}`}>
      <div className="max-w-8xl mx-auto px-8 flex justify-between items-center h-20">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-evenly flex-1 space-x-2">
          {navItems.map(({ href, text, icon }, index) => (
            <Link
              key={index}
              href={href}
              className="group flex items-center gap-2 py-2 px-4 text-xl text-tathir-beige hover:text-warning transition-all duration-300 jersey-10-regular"
            >
              <span className="text-tathir-beige/70 group-hover:text-warning group-hover:scale-110 transition-all duration-300">
                {icon}
              </span>
              <span>{text}</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-tathir-beige/20 group-hover:bg-tathir-beige transform scale-x-0 group-hover:scale-x-100 transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-tathir-beige/10 transition-colors duration-300"
        >
          <div
            className={`w-6 h-0.5 bg-tathir-beige mb-1.5 transition-all duration-300 ${
              mobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></div>
          <div
            className={`w-6 h-0.5 bg-tathir-beige mb-1.5 transition-opacity duration-300 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          ></div>
          <div
            className={`w-6 h-0.5 bg-tathir-beige transition-all duration-300 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></div>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden absolute w-full bg-gradient-to-b from-tathir-dark-green to-tathir-maroon backdrop-blur-lg transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {navItems.map(({ href, text, icon }, index) => (
          <Link
            key={index}
            href={href}
            className="flex items-center gap-3 py-4 px-8 hover:bg-tathir-beige/10 transition-all duration-300 jersey-10-regular"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="p-2 rounded-lg bg-tathir-beige/10 text-tathir-beige">
              {icon}
            </span>
            <span className="text-tathir-cream-light">{text}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
