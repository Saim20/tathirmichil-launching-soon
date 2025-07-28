"use client";

import React from "react";
import {
  Activity,
  ChevronRight,
  UserPen,
  MessageSquareDot,
} from "lucide-react";
import useInView from "../../lib/utils";
import { useRouter } from "next/navigation";

const AssessmentTest = () => {
  const router = useRouter();
  const features = [
    {
      title: "Check the Odds",
      description: "Assess your chances of getting in if you start preparing.",
      icon: <UserPen className="h-8 w-8" />,
    },
    {
      title: "Detailed Analytics",
      description:
        "Get a clear breakdown of how you performed in each section.",
      icon: <Activity className="h-8 w-8" />,
    },
    {
      title: "Personalized Advice",
      description:
        "Based on your performance, I’ll suggest what you should do.",
      icon: <MessageSquareDot className="h-8 w-8" />,
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6  relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[20rem] sm:w-[35rem] h-[20rem] sm:h-[35rem] bg-tathir-maroon/20 rounded-full blur-3xl top-0 right-0 animate-pulse"></div>
        <div className="absolute w-[15rem] sm:w-[25rem] h-[15rem] sm:h-[25rem] bg-tathir-brown/20 rounded-full blur-3xl bottom-0 -left-6 sm:-left-12 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-8 sm:mb-12">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-tathir-maroon via-tathir-brown to-tathir-dark-green opacity-20 blur-lg transform scale-110"></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl uppercase font-bold tracking-wider relative">
                <span className="relative">
                  <span
                    className="relative text-tathir-beige 
                    [text-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),1px_1px_3px_rgba(0,0,0,.3),3px_3px_5px_rgba(0,0,0,.2),5px_5px_10px_rgba(0,0,0,.25),8px_8px_10px_rgba(0,0,0,.2),12px_12px_20px_rgba(0,0,0,.15)] sm:[text-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),2px_2px_3px_rgba(0,0,0,.3),6px_6px_5px_rgba(0,0,0,.2),10px_10px_10px_rgba(0,0,0,.25),15px_15px_10px_rgba(0,0,0,.2),20px_20px_20px_rgba(0,0,0,.15)]"
                  >
                    Assessment Test
                  </span>
                </span>
              </h2>
            </div>
            <div className="relative">
              <p className="text-xl text-tathir-cream-light font-medium jersey-10-regular leading-relaxed">
                You don't have to prepare for this. You do not need to know
                anything really. Just take this 90-minute test built exactly
                like the most recent question papers of the IBA Admissions.
                You'll see your accuracy, time management, strengths and
                weaknesses. You'll get detailed guidance on what you can do
                next. A free test to evaluate your basic aptitude for the topics
                tested in the IBA admission test.
              </p>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-tathir-beige to-transparent"></div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.02] transition-all duration-300 relative
                  [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-30 transition-colors duration-300">
                    <div className="text-tathir-beige">{feature.icon}</div>
                  </div>
                  <h4 className="text-xl uppercase font-bold text-tathir-maroon mb-4">
                    {feature.title}
                  </h4>
                  <p className="text-xl jersey-10-regular">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="text-center">
            <button
              disabled
              className="group px-10 py-5 bg-tathir-maroon/70 text-tathir-beige font-bold rounded-xl border-4 border-tathir-beige cursor-not-allowed transition-all duration-300 relative overflow-hidden shadow-xl opacity-80"
            >
              <span className="flex items-center justify-center uppercase relative z-10 text-lg">
                Coming Soon
                <ChevronRight className="ml-2 h-6 w-6" />
              </span>
            </button>
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

export default AssessmentTest;
