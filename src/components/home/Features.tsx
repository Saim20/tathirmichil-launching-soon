"use client";

import React from "react";
import { BookOpen, Users, Target, Book } from "lucide-react";
import useInView from "../../lib/utils";
import EightBitLinkButton from "../shared/EightBitCardLink";

const Features = () => {
  const features = [
    {
      title: "Blogs",
      icon: <BookOpen className="h-8 w-8" />,
      route: "/blogs",
      image: "/scroll.png",
    },
    {
      title: "Batch",
      icon: <Users className="h-8 w-8" />,
      route: "/batch",
      image: "/totem.png",
    },
    {
      title: "Assessment Test",
      icon: <Target className="h-8 w-8" />,
      route: "/test/assessment",
      image: "/quill.png",
      comingSoon: true,
    },
    {
      title: "Book",
      icon: <Book className="h-8 w-8" />,
      route: "/book",
      image: "/book.webp",
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[20rem] sm:w-[35rem] h-[20rem] sm:h-[35rem] bg-tathir-maroon/20 rounded-full blur-3xl -top-12 sm:-top-24 right-0 animate-pulse"></div>
        <div className="absolute w-[15rem] sm:w-[25rem] h-[15rem] sm:h-[25rem] bg-tathir-brown/20 rounded-full blur-3xl bottom-0 left-0 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-8 sm:mb-12">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-tathir-maroon via-tathir-brown to-tathir-dark-green opacity-20 blur-lg transform scale-110"></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl uppercase font-bold tracking-wider relative">
                <span className="relative">
                  {/* Main text with bottom-right shadow layers for 3D block effect */}
                  <span
                    className="relative text-tathir-beige 
                    [text-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),1px_1px_3px_rgba(0,0,0,.3),3px_3px_5px_rgba(0,0,0,.2),5px_5px_10px_rgba(0,0,0,.25),8px_8px_10px_rgba(0,0,0,.2),12px_12px_20px_rgba(0,0,0,.15)] sm:[text-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),2px_2px_3px_rgba(0,0,0,.3),6px_6px_5px_rgba(0,0,0,.2),10px_10px_10px_rgba(0,0,0,.25),15px_15px_10px_rgba(0,0,0,.2),20px_20px_20px_rgba(0,0,0,.15)]"
                  >
                    What You'll Find Here
                  </span>
                </span>
              </h2>
            </div>
            <div className="relative">
              <p className="text-lg sm:text-xl text-tathir-cream-light font-medium jersey-10-regular leading-relaxed px-2">
                Everything you need to prepare for the IBA admission test, all
                in one place.
              </p>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-tathir-beige to-transparent"></div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          {/* 8-bit Pixel Art Icons Grid */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <EightBitLinkButton
                key={idx}
                title={feature.title}
                icon={feature.icon}
                image={feature.image}
                route={feature.route}
                comingSoon={feature.comingSoon}
              />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

// AnimatedSection wrapper with enhanced scroll animation
const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 rotate-0 scale-100"
          : "opacity-0 translate-y-12 -rotate-2 scale-95"
      }`}
    >
      {children}
    </div>
  );
};

export default Features;
