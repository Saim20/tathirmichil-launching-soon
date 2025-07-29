"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Truck,
  Book,
  BookOpen,
  Info,
  Ruler,
  Hash,
  Star,
  CheckCircle,
  GraduationCap,
  Users,
  Clock,
  Download,
  BookA,
  Gift,
  DollarSign,
  Home,
  HandCoins,
  Wallet,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { bloxat } from "@/components/fonts";
import useInView from "../../../lib/utils";
import OrderForm from "./OrderForm";
import Link from "next/link";
import { FaMoneyBill } from "react-icons/fa";

interface BookDetails {
  title: string;
  author: string;
  price: number;
  description: string;
  dimensions: string;
  pages: number;
  language: string;
  isbn: string;
  coverImage: string;
}

export default function BookPage() {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookDetails() {
      try {
        const bookDoc = await getDoc(doc(db, "data", "book"));
        if (!bookDoc.exists()) {
          throw new Error("Book details not found");
        }
        setBookDetails(bookDoc.data() as BookDetails);
      } catch (err) {
        setError("Failed to load book details");
        console.error("Error fetching book details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookDetails();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showOrderForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showOrderForm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-tathir-cream flex items-center justify-center px-4">
        <div
          className="bg-tathir-beige rounded-2xl p-8 sm:p-10 lg:p-12 max-w-md w-full
          [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
        >
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-tathir-brown/30 border-t-tathir-maroon rounded-full animate-spin mx-auto"></div>
              <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-tathir-maroon" />
            </div>
            <h3
              className={`text-2xl font-bold text-tathir-maroon ${bloxat.className}`}
            >
              Loading Book Details
            </h3>
            <p className="text-tathir-brown jersey-10-regular">
              Please wait while we fetch the information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bookDetails) {
    return (
      <div className="min-h-screen bg-tathir-cream flex items-center justify-center px-4">
        <div
          className="bg-tathir-beige rounded-2xl p-8 sm:p-10 lg:p-12 max-w-md w-full
          [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
        >
          <div className="text-center space-y-4">
            <Info className="w-12 h-12 text-red-500 mx-auto" />
            <h3
              className={`text-2xl font-bold text-tathir-maroon ${bloxat.className}`}
            >
              Something went wrong
            </h3>
            <p className="text-tathir-brown jersey-10-regular">
              {error || "Failed to load book details"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={`px-6 py-3 bg-tathir-maroon text-tathir-beige font-bold rounded-lg hover:bg-tathir-brown transition-colors 
                [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1)] ${bloxat.className}`}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tathir-cream p-6 pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <AnimatedSection>
          <div className="items-center flex flex-col text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-6 bg-tathir-beige px-6 py-3 rounded-full 
              [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1)]"
            >
              <Home className="text-tathir-maroon w-5 h-5" />
              <span
                className={`text-tathir-maroon font-bold ${bloxat.className}`}
              >
                Home
              </span>
            </Link>

            <div className="flex items-center justify-center gap-4 mb-6">
              <Book className="w-8 h-8 text-tathir-maroon" />
              <h2
                className={`text-4xl md:text-6xl font-bold text-tathir-maroon ${bloxat.className}`}
              >
                {bookDetails.title}
              </h2>
            </div>
            <p className="text-xl jersey-10-regular text-tathir-brown max-w-2xl mx-auto leading-relaxed">
              Everything you need to ace the test, within one book
            </p>
          </div>
        </AnimatedSection>

        {/* Main Book Card */}
        <AnimatedSection>
          <div
            className="bg-tathir-beige rounded-2xl p-8 sm:p-10 lg:p-12 
            [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
            transform hover:scale-[1.01] transition-all duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Book Image Section */}
              <Link
                href={"/book/preview"}
                className="flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-tathir-cream rounded-lg"
              >
                <div className="relative">
                  <div
                    className="relative w-65 h-72 sm:w-65 sm:h-72 md:w-85 md:h-96 lg:w-100 lg:h-118 bg-white rounded-lg shadow-lg overflow-hidden 
                  [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1)]
                  hover:shadow-xl transition-shadow duration-300"
                  >
                    <Image
                      src={bookDetails.coverImage}
                      alt={bookDetails.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Badge */}
                  <div
                    className="absolute -top-2 -right-2 bg-tathir-maroon text-tathir-beige px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold
                  [box-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_1px_rgba(0,0,0,.1)]"
                  >
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1" />
                  </div>
                </div>
              </Link>

              {/* Book Details Section */}
              <div className="space-y-6">
                {/* Author */}
                <div>
                  <p className="text-lg jersey-10-regular text-tathir-brown">
                    by{" "}
                    <span
                      className={`font-bold text-tathir-maroon ${bloxat.className}`}
                    >
                      {bookDetails.author}
                    </span>
                  </p>
                </div>

                {/* Price Section */}
                <div
                  className="bg-tathir-cream p-6 rounded-lg 
                  [box-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_1px_rgba(0,0,0,.1)]"
                >
                  <div className="mb-4">
                    <div
                      className={`text-3xl font-bold text-tathir-maroon mb-4 ${bloxat.className}`}
                    >
                      ৳ {bookDetails.price.toLocaleString()}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className={`text-lg font-bold text-tathir-maroon ${bloxat.className} flex items-center gap-2`}>
                        <Truck className="w-5 h-5" />
                        Delivery Charges
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-tathir-beige p-3 rounded-lg [box-shadow:1px_1px_0_#7a4f3a,2px_2px_1px_rgba(0,0,0,.1)]">
                          <div className={`text-sm font-bold text-tathir-maroon ${bloxat.className}`}>
                            Inside Dhaka
                          </div>
                          <div className="text-lg font-bold text-tathir-brown jersey-10-regular">
                            ৳ 90
                          </div>
                        </div>
                        
                        <div className="bg-tathir-beige p-3 rounded-lg [box-shadow:1px_1px_0_#7a4f3a,2px_2px_1px_rgba(0,0,0,.1)]">
                          <div className={`text-sm font-bold text-tathir-maroon ${bloxat.className}`}>
                            Dhaka Suburban
                          </div>
                          <div className="text-lg font-bold text-tathir-brown jersey-10-regular">
                            ৳ 120
                          </div>
                        </div>
                        
                        <div className="bg-tathir-beige p-3 rounded-lg [box-shadow:1px_1px_0_#7a4f3a,2px_2px_1px_rgba(0,0,0,.1)]">
                          <div className={`text-sm font-bold text-tathir-maroon ${bloxat.className}`}>
                            Outside Dhaka
                          </div>
                          <div className="text-lg font-bold text-tathir-brown jersey-10-regular">
                            ৳ 150
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-tathir-brown jersey-10-regular leading-relaxed">
                        <p>• Orders of more than 1 book will lead to higher delivery charges</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3
                    className={`text-xl font-bold text-tathir-maroon mb-3 flex items-center gap-2 ${bloxat.className}`}
                  >
                    <BookOpen className="w-5 h-5" />
                    What's Inside
                  </h3>
                  <p className="text-tathir-brown jersey-10-regular leading-relaxed">
                    {bookDetails.description}
                  </p>
                </div>

                {/* Order Button */}
                <Link
                  href={"/book/preview"}
                  type="button"
                  className={`w-full px-8 py-4 bg-tathir-cream text-tathir-maroon font-bold rounded-lg 
                    hover:bg-tathir-brown hover:text-tathir-beige transition-all duration-300 transform hover:scale-[1.02]
                    flex items-center justify-center gap-3 relative overflow-hidden
                    [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                    ${bloxat.className}`}
                >
                  <BookA className="w-5 h-5" />
                  <span className="relative z-10">See What's Inside</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Link>
                {/* Order Button */}
                <button
                  onClick={() => setShowOrderForm(true)}
                  type="button"
                  className={`w-full px-8 py-4 bg-tathir-maroon text-tathir-beige font-bold rounded-lg 
                    hover:bg-tathir-brown transition-all duration-300 transform hover:scale-[1.02]
                    flex items-center justify-center gap-3 relative overflow-hidden
                    [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                    ${bloxat.className}`}
                >
                  <HandCoins className="w-5 h-5" />
                  <span className="relative z-10">
                    Pre-order on Cash on delivery
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
                <button
                  disabled
                  type="button"
                  className={`w-full px-8 py-4 bg-tathir-maroon text-tathir-beige font-bold rounded-lg 
                  cursor-not-allowed opacity-75
                  flex items-center justify-center gap-3 relative overflow-hidden
                  [box-shadow:2px_2px_0_#9ca3af,4px_4px_0_#9ca3af,6px_6px_1px_rgba(0,0,0,.1)]
                  ${bloxat.className}`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="relative z-10">Bkash Payment - Coming Soon</span>
                </button>
                <button
                  disabled
                  type="button"
                  className={`w-full px-8 py-4 bg-tathir-maroon text-tathir-beige font-bold rounded-lg 
                    cursor-not-allowed opacity-75
                    flex items-center justify-center gap-3 relative overflow-hidden
                    [box-shadow:2px_2px_0_#9ca3af,4px_4px_0_#9ca3af,6px_6px_1px_rgba(0,0,0,.1)]
                    ${bloxat.className}`}
                >
                  <Gift className="w-5 h-5" />
                  <span className="relative z-10">Gift Someone - Coming Soon</span>
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Book Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedSection>
            <div
              className="bg-tathir-beige rounded-2xl p-8 h-full flex flex-col
              [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
              transform hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <Ruler className="w-6 h-6 text-tathir-maroon" />
                <h3
                  className={`text-xl font-bold text-tathir-maroon ${bloxat.className}`}
                >
                  Book Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
                <div
                  className="text-center p-4 bg-tathir-cream rounded-lg 
                  [box-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_1px_rgba(0,0,0,.1)]"
                >
                  <div
                    className={`text-2xl sm:text-xl md:text-2xl font-bold text-tathir-maroon ${bloxat.className}`}
                  >
                    {bookDetails.pages}
                  </div>
                  <div className="text-sm jersey-10-regular text-tathir-brown">
                    Pages
                  </div>
                </div>
                <div
                  className="text-center p-4 bg-tathir-cream rounded-lg 
                  [box-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_1px_rgba(0,0,0,.1)]"
                >
                  <div
                    className={`text-2xl sm:text-xl md:text-2xl font-bold text-tathir-maroon ${bloxat.className}`}
                  >
                    {bookDetails.language}
                  </div>
                  <div className="text-sm jersey-10-regular text-tathir-brown">
                    Language
                  </div>
                </div>
                <div
                  className="text-center p-4 bg-tathir-cream rounded-lg 
                  [box-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_1px_rgba(0,0,0,.1)]
                  sm:col-span-2 md:col-span-1"
                >
                  <div
                    className={`text-2xl sm:text-xl md:text-2xl font-bold text-tathir-maroon ${bloxat.className}`}
                  >
                    {bookDetails.dimensions}
                  </div>
                  <div className="text-sm jersey-10-regular text-tathir-brown">
                    Dimensions
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div
              className="bg-tathir-beige rounded-2xl p-8 h-full flex flex-col
              [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
              transform hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6 text-tathir-maroon" />
                <h3
                  className={`text-xl font-bold text-tathir-maroon ${bloxat.className}`}
                >
                  Delivery Information
                </h3>
              </div>

              <div className="space-y-3 flex-grow">
                <div className="flex items-center gap-3 text-tathir-brown jersey-10-regular">
                  <CheckCircle className="w-5 h-5 text-tathir-maroon" />
                  <span>Cash on Delivery Available</span>
                </div>
                <div className="flex items-center gap-3 text-tathir-brown jersey-10-regular">
                  <Clock className="w-5 h-5 text-tathir-maroon" />
                  <span>Seamless delivery once the book is printed</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Features Section */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedSection>
            <div
              className="bg-tathir-beige rounded-2xl p-8 
              [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
              transform hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-6 h-6 text-tathir-maroon" />
                <h3
                  className={`text-xl font-bold text-tathir-maroon ${bloxat.className}`}
                >
                  Expert Content
                </h3>
              </div>

              <p className="text-tathir-brown jersey-10-regular leading-relaxed">
                Written by IBA alumni and admission experts with proven track
                records.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div
              className="bg-tathir-beige rounded-2xl p-8 
              [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
              transform hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-6 h-6 text-tathir-maroon" />
                <h3
                  className={`text-xl font-bold text-tathir-maroon ${bloxat.className}`}
                >
                  Fast Delivery
                </h3>
              </div>

              <p className="text-tathir-brown jersey-10-regular leading-relaxed">
                Get your copy delivered to your doorstep within 2-3 days.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div
              className="bg-tathir-beige rounded-2xl p-8 
              [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
              transform hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-tathir-maroon" />
                <h3
                  className={`text-xl font-bold text-tathir-maroon ${bloxat.className}`}
                >
                  Proven Results
                </h3>
              </div>

              <p className="text-tathir-brown jersey-10-regular leading-relaxed">
                Thousands of successful students have used this guide to ace
                their IBA admission.
              </p>
            </div>
          </AnimatedSection>
        </div> */}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowOrderForm(false)}
          />
          <div className="relative z-60 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <OrderForm
              price={bookDetails.price}
              onClose={() => setShowOrderForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
