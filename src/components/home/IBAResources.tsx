"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import useInView from "../../lib/utils";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import Link from "next/link";

const IBAResources = () => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await getDoc(doc(db, "data", "book"));
        if (!response.exists()) throw new Error("Failed to fetch image");
        const data = response.data();
        if (!data || !data.coverImage) throw new Error("Image URL not found");
        console.log("Fetched image URL:", data.coverImage);
        if (data.coverImage.startsWith("http")) {
          setImageUrl(data.coverImage);
        } else {
          setImageUrl(`/${data.coverImage}`);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  const router = useRouter();
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6  relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[20rem] sm:w-[35rem] h-[20rem] sm:h-[35rem] bg-tathir-maroon/20 rounded-full blur-3xl top-0 -left-12 sm:-left-24 animate-pulse"></div>
        <div className="absolute w-[15rem] sm:w-[25rem] h-[15rem] sm:h-[25rem] bg-tathir-brown/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <AnimatedSection>
            <div
              className="group w-full max-w-sm mx-auto lg:max-w-md xl:max-w-lg bg-tathir-beige rounded-xl transform hover:scale-[1.02] transition-all duration-300 relative
                      [box-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1)] sm:[box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
            >
              <div className="aspect-[5/6] w-full">
                {loading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded-xl"></div>
                ) : (
                  <Link href={"/book/preview"}>
                    <Image
                      src={imageUrl || "/book.png"}
                      alt="IBA Book Cover"
                      width={500}
                      height={667}
                      className="w-full h-full object-cover rounded-xl"
                      priority
                    />
                  </Link>
                )}
              </div>
            </div>
          </AnimatedSection>

          <div className="text-center lg:text-left">
            <AnimatedSection>
              <div className="mb-6 sm:mb-8">
                <div className="relative inline-block mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-tathir-maroon via-tathir-brown to-tathir-dark-green opacity-20 blur-lg transform scale-110"></div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl uppercase font-bold tracking-wider relative">
                    <span className="relative">
                      <span
                        className="relative text-tathir-beige 
                        [text-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),1px_1px_3px_rgba(0,0,0,.3),3px_3px_5px_rgba(0,0,0,.2),5px_5px_10px_rgba(0,0,0,.25),8px_8px_10px_rgba(0,0,0,.2),12px_12px_20px_rgba(0,0,0,.15)] sm:[text-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),2px_2px_3px_rgba(0,0,0,.3),6px_6px_5px_rgba(0,0,0,.2),10px_10px_10px_rgba(0,0,0,.25),15px_15px_10px_rgba(0,0,0,.2),20px_20px_20px_rgba(0,0,0,.15)]"
                      >
                        The IBA Book
                      </span>
                    </span>
                  </h2>
                </div>
                <div className="relative">
                  <p className="text-lg sm:text-xl text-tathir-cream-light font-medium jersey-10-regular leading-relaxed px-2 lg:px-0">
                    This book was put together after years of watching students
                    lose their mind and waste their crucial time running between
                    random SAT, GRE, and GMAT books and websites. About IBA, How
                    to Prepare, The Admission Process, English, Math,
                    Analytical, Writing, Viva, Exam Hall Strategies, it has
                    everything you should know and every topic you need to
                    practice to ace the IBA admission test from scratch.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div
                className="mt-6 sm:mt-8 flex justify-center lg:justify-start"
                onClick={() => {
                  router.push("/book");
                }}
              >
                <Link
                  href={"/book"}
                  className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-tathir-maroon text-tathir-beige font-bold rounded-xl border-4 border-tathir-beige hover:brightness-110 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden shadow-xl"
                >
                  <span className="flex items-center justify-center uppercase relative z-10 text-base sm:text-lg">
                    More About the Book
                    <ChevronRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
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

export default IBAResources;
