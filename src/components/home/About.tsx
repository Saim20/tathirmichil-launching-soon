"use client";

import React from "react";
import { User, Award, Lightbulb, Shield } from "lucide-react";
import useInView from "../../lib/utils";
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import { bloxat } from "@/components/fonts";

interface StatItem {
  icon: React.ReactElement;
  label: string;
  value: string;
}

interface AnimatedSectionProps {
  children: React.ReactNode;
}

const About: React.FC<{ variant?: "home" | "batch" }> = ({
  variant = "home",
}) => {
  const stats: StatItem[] = [
    {
      icon: <Shield className="h-6 w-6" />,
      label: "Teaching Experience",
      value: "18+ Years",
    },
    {
      icon: <Award className="h-6 w-6" />,
      label: "IBA Success Rate",
      value: "95%",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      label: "Student Satisfaction",
      value: "100%",
    },
    {
      icon: <User className="h-6 w-6" />,
      label: "Students Guided",
      value: "10,000+",
    },
  ];

  // Variant-based styling
  const sectionBg = variant === "batch" ? "bg-transparent" : "";
  const titleColor =
    variant === "batch" ? "text-tathir-maroon" : "text-tathir-beige";
  const titleFont = variant === "batch" ? bloxat.className : "";
  const titleShadow =
    variant === "batch"
      ? ""
      : "[text-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),1px_1px_3px_rgba(0,0,0,.3),3px_3px_5px_rgba(0,0,0,.2),5px_5px_10px_rgba(0,0,0,.25),8px_8px_10px_rgba(0,0,0,.2),12px_12px_20px_rgba(0,0,0,.15)] sm:[text-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),2px_2px_3px_rgba(0,0,0,.3),6px_6px_5px_rgba(0,0,0,.2),10px_10px_10px_rgba(0,0,0,.25),15px_15px_10px_rgba(0,0,0,.2),20px_20px_20px_rgba(0,0,0,.15)]";
  const cardBg = variant === "batch" ? "bg-tathir-beige" : "bg-tathir-beige";
  const boxShadow =
    variant === "batch"
      ? "[box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
      : "[box-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1)] sm:[box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]";

  return (
    <section
      className={`py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden ${sectionBg}`}
    >
      <div className="max-w-5xl mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="inset-0  opacity-20 blur-lg transform scale-110"></div>
              <h2
                className={`text-2xl sm:text-3xl lg:text-4xl uppercase font-bold tracking-wider relative ${titleFont}`}
              >
                <span className="relative">
                  {/* Main text with variant-based styling */}
                  <span className={`relative ${titleColor} ${titleShadow}`}>
                    About Me
                  </span>
                </span>
              </h2>
            </div>
          </div>
        </AnimatedSection>

        <div
          className={variant === "batch" ? `relative left-1/2 transform -translate-x-1/2 w-16 sm:w-24 lg:w-32 h-1 bg-gradient-to-r from-transparent via-tathir-maroon to-transparent mb-8`:`relative mb-8 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-tathir-beige to-transparent`}
        ></div>

        <AnimatedSection>
          <div
            className={`group ${cardBg} rounded-xl p-6 sm:p-8 transform hover:scale-[1.02] transition-all duration-300 relative ${boxShadow}`}
          >
            <p className="jersey-10-regular text-lg sm:text-xl leading-relaxed">
              I've been through the IBA preparation multiple times, both as a
              thriving candidate and later as a dedicated tutor. I've seen the
              journey of countless students during the past three admission
              seasons. I've seen what works and what doesn't. With my firsthand
              experience, I've built the best preparation roadmap for the IBA
              BBA admission test.
            </p>
            <div className="mt-6 sm:mt-8 border-t-2 border-tathir-maroon/20 pt-4 sm:pt-6">
              <div className="flex flex-col items-center">
                <h3 className="text-lg sm:text-xl uppercase font-bold text-tathir-maroon mb-2">
                  Tathir Mohtadi Chowdhury
                </h3>
                <p className="text-lg sm:text-xl text-tathir-brown mb-4 sm:mb-6 jersey-10-regular">
                  Rank I, IBA 31st Batch
                </p>
                <div className="flex gap-3 sm:gap-4">
                  <a
                    href="https://www.facebook.com/share/1C6HSoet3V/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-4 py-2 bg-tathir-maroon text-tathir-beige rounded-lg hover:bg-tathir-brown transition-colors duration-300 flex items-center gap-2"
                  >
                    <FaFacebook className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                  <a
                    href="https://instagram.com/tathirchowdhury"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-4 py-2 bg-tathir-maroon text-tathir-beige rounded-lg hover:bg-tathir-brown transition-colors duration-300 flex items-center gap-2"
                  >
                    <FaInstagram className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                  <a
                    href="https://youtube.com/@tathirmohtadi?si=Rjm_uxx0SUUPvtm1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-4 py-2 bg-tathir-maroon text-tathir-beige rounded-lg hover:bg-tathir-brown transition-colors duration-300 flex items-center gap-2"
                  >
                    <FaYoutube className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/tathirmohtadi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-4 py-2 bg-tathir-maroon text-tathir-beige rounded-lg hover:bg-tathir-brown transition-colors duration-300 flex items-center gap-2"
                  >
                    <FaLinkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

// AnimatedSection wrapper with enhanced scroll animation
const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children }) => {
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

export default About;
