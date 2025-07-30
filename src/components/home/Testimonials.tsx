"use client"
import React, { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight, X, BookOpen } from 'lucide-react';
import useInView from '../../lib/utils';
import { testimonials, Testimonial } from '@/lib/constants/testimonials';
import { bloxat } from '@/components/fonts';

// Modal Component for full testimonial
const TestimonialModal: React.FC<{ 
  testimonial: Testimonial | null, 
  isOpen: boolean, 
  onClose: () => void 
}> = ({ testimonial, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position before preventing scroll
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position when closing
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !testimonial) return null;

  return (
    <div 
      className="z-50" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        minWidth: '100vw',
        minHeight: '100vh',
        margin: 0,
        padding: 0
      }}
    >
      {/* Backdrop */}
      <div 
        className="bg-black/70 backdrop-blur-sm transition-opacity duration-200"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          minWidth: '100vw',
          minHeight: '100vh',
          margin: 0,
          padding: 0
        }}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className="flex items-center justify-center p-4" 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          minWidth: '100vw',
          minHeight: '100vh',
          margin: 0,
          padding: '16px'
        }}
      >
        {/* Modal Content */}
        <div className="relative bg-tathir-beige rounded-2xl p-6 sm:p-8 lg:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-tathir-brown/20 transition-all duration-200 transform scale-100 z-10">
          {/* Decorative corner element */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-tathir-maroon/10 to-transparent rounded-bl-2xl"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-tathir-maroon hover:text-tathir-brown transition-colors duration-200 hover:bg-tathir-maroon/10 rounded-full z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-tathir-maroon to-tathir-brown p-4 rounded-full shadow-lg mx-auto w-fit mb-4">
              <Quote className="h-8 w-8 text-tathir-beige" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-tathir-maroon mb-2">
              {testimonial.name}
            </h3>
            <p className="text-sm sm:text-base text-tathir-brown jersey-10-regular font-medium">
              {testimonial.role}
            </p>
          </div>

          {/* Full Quote */}
          <div className="mb-6 p-4 bg-tathir-cream/20 rounded-lg border-l-4 border-tathir-maroon">
            <p className="text-base sm:text-lg jersey-10-regular leading-relaxed text-tathir-dark-green">
              "{testimonial.quote}"
            </p>
          </div>

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-tathir-maroon hover:bg-tathir-brown text-tathir-beige rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard: React.FC<{ 
  testimonial: Testimonial, 
  onReadMore: () => void,
  variant?: 'home' | 'batch' 
}> = ({ testimonial, onReadMore, variant = 'home' }) => {
  const isLongQuote = testimonial.quote.length > 150; // Reduced threshold for better UX
  const truncatedQuote = isLongQuote 
    ? testimonial.quote.slice(0, 270) + "..." 
    : testimonial.quote;
  
  // Theme-based styling
  const cardBg = variant === 'batch' ? 'bg-tathir-beige' : 'bg-tathir-beige';
  const textColor = variant === 'batch' ? 'text-tathir-maroon' : 'text-tathir-maroon';
  const nameColor = variant === 'batch' ? 'text-tathir-maroon group-hover:text-tathir-brown' : 'text-tathir-maroon group-hover:text-tathir-brown';
  const roleColor = variant === 'batch' ? 'text-tathir-brown/80' : 'text-tathir-brown/80';
  const iconBg = variant === 'batch' ? 'from-tathir-maroon to-tathir-brown' : 'from-tathir-maroon to-tathir-brown';
  const boxShadow = variant === 'batch' 
    ? '[box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]'
    : '[box-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1)] sm:[box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]';
    
  return (
    <div className={`group ${cardBg} rounded-2xl p-6 sm:p-7 lg:p-8 transform hover:scale-[1.02] transition-all duration-500 relative
      shadow-[0_8px_32px_rgba(122,79,58,0.2)]]
      border border-tathir-brown/10 hover:border-tathir-brown/20
      flex flex-col justify-between
      my-4
      h-[500px]
      overflow-hidden
      ${boxShadow}`}
    >
      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-tathir-maroon/10 to-transparent rounded-bl-2xl"></div>
      
      <div className="flex flex-col h-full">
        {/* Quote icon and quote text */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-center mb-4">
            <div className={`bg-gradient-to-r ${iconBg} p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Quote className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-tathir-beige" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-2">
            <p className={`text-sm sm:text-base lg:text-lg jersey-10-regular leading-relaxed ${textColor} text-center line-clamp-9`}>
              "{truncatedQuote}"
            </p>
          </div>
        </div>

        {/* Read More Button (only show if quote is truncated) */}
        {isLongQuote && (
          <div className="flex justify-center mb-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                onReadMore();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-tathir-maroon/10 to-tathir-brown/10 hover:from-tathir-maroon/20 hover:to-tathir-brown/20 text-tathir-maroon hover:text-tathir-brown rounded-lg transition-all duration-300 font-medium border border-tathir-maroon/20 hover:border-tathir-maroon/40 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              Read More
            </button>
          </div>
        )}

        {/* Name and role */}
        <div className="text-center border-t border-tathir-brown/10 pt-4">
          <h4 className={`text-base sm:text-lg lg:text-xl font-bold ${nameColor} mb-1 transition-colors duration-300`}>
            {testimonial.name}
          </h4>
          <p className={`text-xs sm:text-sm lg:text-base ${roleColor} jersey-10-regular font-medium`}>
            {testimonial.role}
          </p>
        </div>
      </div>

      {/* Subtle hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-tathir-maroon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
    </div>
  );
};

const Testimonials: React.FC<{ variant?: 'home' | 'batch' }> = ({ variant = 'home' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [maxIndex, setMaxIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (testimonial: Testimonial) => {
    // Store current scroll position
    const scrollY = window.scrollY;
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
    // Restore scroll position after modal opens
    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  // Handle responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setItemsPerView(3); // Desktop: 3 items
      } else if (width >= 768) {
        setItemsPerView(2); // Tablet: 2 items
      } else {
        setItemsPerView(1); // Mobile: 1 item
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Update max index when items per view changes
  useEffect(() => {
    setMaxIndex(Math.max(0, testimonials.length - itemsPerView));
    // Reset current index if it exceeds new max
    setCurrentIndex(prev => Math.min(prev, Math.max(0, testimonials.length - itemsPerView)));
  }, [itemsPerView]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || maxIndex === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= maxIndex) {
          return 0; // Loop back to start
        }
        return prev + 1;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex]);

  const nextSlide = () => {
    setIsAutoPlaying(false); // Stop auto-play when user interacts
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setIsAutoPlaying(false); // Stop auto-play when user interacts
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false); // Stop auto-play when user interacts
    setCurrentIndex(Math.min(index, maxIndex));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < maxIndex) {
      nextSlide();
    }
    if (isRightSwipe && currentIndex > 0) {
      prevSlide();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, maxIndex]);

  // Theme-based styling for the main section
  const sectionBg = variant === 'batch' ? 'bg-transparent' : '';
  const titleColor = variant === 'batch' 
    ? 'text-tathir-maroon '
    : 'text-tathir-beige [text-shadow:1px_1px_0_#7a4f3a,2px_2px_0_#7a4f3a,3px_3px_0_#7a4f3a,4px_4px_0_#7a4f3a,5px_5px_0_#7a4f3a,6px_6px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),1px_1px_3px_rgba(0,0,0,.3),3px_3px_5px_rgba(0,0,0,.2),5px_5px_10px_rgba(0,0,0,.25)] sm:[text-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]';
  const subtitleColor = variant === 'batch' ? 'text-tathir-brown' : 'text-tathir-cream-light';
  const underlineColor = variant === 'batch' ? 'from-transparent via-tathir-maroon to-transparent' : 'from-transparent via-tathir-beige to-transparent';
  const titleFont = variant === 'batch' ? bloxat.className : '';

  return (
    <>
      <section className={`py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${sectionBg}`}>

        <div className="max-w-7xl mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-tathir-maroon via-tathir-brown to-tathir-dark-green opacity-20 blur-lg transform scale-110"></div>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl uppercase font-bold tracking-wider relative ${titleFont}`}>
                <span className={`relative ${titleColor}`}>
                  Testimonials
                </span>
              </h2>
            </div>
            <div className="relative">
              <div className={`absolute -bottom-2 sm:-bottom-3 left-1/2 transform -translate-x-1/2 w-16 sm:w-24 lg:w-32 h-1 bg-gradient-to-r ${underlineColor}`}></div>
            </div>
          </div>
        </AnimatedSection>

        {/* Unified Responsive Carousel */}
        <AnimatedSection>
          <div 
            className="relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`absolute left-0 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 lg:p-4 bg-black/20 backdrop-blur-lg text-tathir-beige rounded-lg sm:rounded-xl border-2 border-tathir-beige/20 transition-all duration-300 hover:scale-110 ${
                currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-tathir-beige/40 hover:bg-black/30'
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>

            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className={`absolute right-0 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 lg:p-4 bg-black/20 backdrop-blur-lg text-tathir-beige rounded-lg sm:rounded-xl border-2 border-tathir-beige/20 transition-all duration-300 hover:scale-110 ${
                currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:border-tathir-beige/40 hover:bg-black/30'
              }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>

            {/* Carousel Container */}
            <div 
              className="overflow-hidden px-6 sm:px-12 lg:px-16"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
              >
                {testimonials.map((testimonial, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 px-2 sm:px-3 lg:px-4 ${
                      itemsPerView === 1 ? 'w-full' : 
                      itemsPerView === 2 ? 'w-1/2' : 'w-1/3'
                    }`}
                  >
                    <TestimonialCard 
                      testimonial={testimonial} 
                      onReadMore={() => openModal(testimonial)}
                      variant={variant}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="mt-6 sm:mt-8 lg:mt-10 flex justify-center items-center gap-1.5 sm:gap-2 lg:gap-3 px-4">
              <div className="flex gap-2 lg:gap-3">
                {maxIndex > 0 && Array.from({ length: maxIndex + 1 }, (_, idx) => (
                  <div
                    key={`desktop-${idx}`}
                    onClick={() => goToSlide(idx)}
                    className={`h-2.5 lg:h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                      idx === currentIndex
                        ? 'w-5 lg:w-12 bg-tathir-beige shadow-lg'
                        : 'w-2.5 lg:w-3 bg-tathir-beige/50 hover:bg-tathir-beige/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Testimonial Modal */}
    <TestimonialModal 
      testimonial={selectedTestimonial} 
      isOpen={isModalOpen} 
      onClose={closeModal} 
    />
  </>
  );
};

// AnimatedSection wrapper with enhanced scroll animation
const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
};

export default Testimonials;