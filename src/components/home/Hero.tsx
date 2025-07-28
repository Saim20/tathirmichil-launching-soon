"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Sparkles, BookOpen, Target, Users, LogIn } from "lucide-react";
import useInView from "../../lib/utils";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      text: "Take the Assessment Test",
      color: "bg-tathir-maroon"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      text: "Get the IBA Book",
      color: "bg-tathir-brown"
    },
    {
      icon: <Users className="h-6 w-6" />,
      text: "Join the Community",
      color: "bg-tathir-dark-green"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full min-h-screen pb-12 sm:pb-20 pt-16 sm:pt-24 relative flex flex-col items-center justify-center text-center px-4 sm:px-6 overflow-hidden">

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[20rem] sm:w-[40rem] h-[20rem] sm:h-[40rem] bg-tathir-maroon/20 rounded-full blur-3xl -top-48 sm:-top-96 -left-24 sm:-left-48 animate-pulse"></div>
        <div className="absolute w-[15rem] sm:w-[30rem] h-[15rem] sm:h-[30rem] bg-tathir-brown/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse delay-1000"></div>
        <div className="absolute w-[10rem] sm:w-[20rem] h-[10rem] sm:h-[20rem] bg-tathir-dark-green/20 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 w-full">
        <AnimatedSection>
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-tathir-maroon via-tathir-brown to-tathir-dark-green opacity-20 blur-lg transform scale-110"></div>
              <h1 className="text-4xl sm:text-6xl lg:text-8xl xl:text-9xl uppercase font-bold tracking-wider leading-none relative">
                <span className="inline-flex items-center">
                  <span className="relative">
                    {/* Main text with bottom-right shadow layers for 3D block effect */}
                    <span className="absolute left-1 sm:left-2 top-1 sm:top-2 text-[#7a4f3a]">TathirMichil</span>
                    <span className="absolute left-0.5 sm:left-1.5 top-0.5 sm:top-1.5 text-[#7a4f3a]">TathirMichil</span>
                    <span className="absolute left-0.5 sm:left-1 top-0.5 sm:top-1 text-[#7a4f3a]">TathirMichil</span>
                    <span className="absolute left-0.25 sm:left-0.5 top-0.25 sm:top-0.5 text-[#7a4f3a]">TathirMichil</span>
                    <span className="relative text-tathir-beige 
                      [text-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),1px_1px_3px_rgba(0,0,0,.3),3px_3px_5px_rgba(0,0,0,.2),5px_5px_10px_rgba(0,0,0,.25),8px_8px_10px_rgba(0,0,0,.2),12px_12px_20px_rgba(0,0,0,.15)] sm:[text-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),2px_2px_3px_rgba(0,0,0,.3),6px_6px_5px_rgba(0,0,0,.2),10px_10px_10px_rgba(0,0,0,.25),15px_15px_10px_rgba(0,0,0,.2),20px_20px_20px_rgba(0,0,0,.15)]">
                      TathirMichil
                    </span>
                  </span>
                </span>
              </h1>
            </div>

            <div className="relative">
              <p className="text-lg sm:text-2xl lg:text-4xl text-white font-medium max-w-4xl mx-auto jersey-10-regular leading-relaxed px-2">
                The best community for IBA preparation
              </p>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-tathir-beige to-transparent"></div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="flex flex-col gap-4 items-center justify-center mt-8 w-full max-w-md mx-auto sm:max-w-none sm:flex-row">
            <button onClick={() => router.push('/login')} className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-tathir-dark-green text-tathir-beige font-bold rounded-xl border-4 border-tathir-light-green hover:brightness-110 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden shadow-xl">
              <span className="flex items-center justify-center uppercase relative z-10 text-base sm:text-lg">
                Login
                <ChevronRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tathir-light-green to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>

            <button onClick={() => router.push('/signup')} className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-tathir-light-green text-tathir-beige font-bold rounded-xl border-4 border-tathir-dark-green hover:brightness-110 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden shadow-xl">
              <span className="flex items-center justify-center uppercase relative z-10 text-base sm:text-lg">
                Sign Up
                <ChevronRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tathir-dark-green/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
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
      className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0 rotate-0 scale-100' : 'opacity-0 translate-y-12 -rotate-2 scale-95'
        }`}
    >
      {children}
    </div>
  );
};

export default Hero;