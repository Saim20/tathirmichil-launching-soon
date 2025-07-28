"use client";

import React, { useState } from "react";
import {
  Users,
  BookOpen,
  Target,
  Calendar,
  Video,
  Trophy,
  ChevronRight,
  FileText,
  Filter,
  Home,
} from "lucide-react";
import { bloxat } from "@/components/fonts";
import Link from "next/link";
import useInView from "../../lib/utils";
import Testimonials from "@/components/home/Testimonials";
import About from "@/components/home/About";

const BatchPage = () => {
  const [selectedBatch, setSelectedBatch] = useState("regular");

  const batchData = {
    regular: {
      name: "Personal Batch",
      subtitle: "৳ 900 / class",
      price: {
        total: "৳ 7,200 / Month",
      },
      features: {
        classes: "24+",
        mockTests: "20+",
        classesPerMonth: "8 classes",
        duration: "2 hours+",
        format: "Online via Zoom",
        timing: "Up to discussion",
        topics: ["Math", "English", "Analytical", "Writing"],
      },
      highlights: [
        "Comprehensive topic coverage",
        "20+ full-length mock tests",
        "Flexible timing based on discussion",
        "Small batch size for personalized attention",
        "Complete IBA preparation from basics to advanced",
        "Monthly progress tracking",
        "Individual doubt clearing sessions",
        "Peer learning environment",
      ],
      description:
        "Our flagship program designed for students who want comprehensive preparation over 3 months. Perfect for building strong fundamentals and achieving consistent high scores.",
    },
    crash: {
      name: "Crash Batch",
      subtitle: "Intensive Last-Month Preparation",
      price: {
        total: "৳ 9,000",
        note: "one-time payment",
      },
      features: {
        classes: "7 (+more if possible)",
        mockTests: "10 live mock tests",
        duration: "2 hours+",
        format: "Online via Zoom",
        timing: "TBA",
        topics: ["High-yield topics", "Frequently tested patterns"],
      },
      highlights: [
        "Focused on high-yield topics",
        "10 intensive live mock tests",
        "Quick revision techniques",
        "Exam strategy and time management",
        "Last-minute preparation boost",
        "Targeted practice sessions",
        "Stress management techniques",
        "Final sprint preparation",
      ],
      description:
        "Intensive preparation program perfect for students who need focused last-minute preparation with maximum impact in minimum time.",
    },
  };

  const getCurrentBatch = () =>
    batchData[selectedBatch as keyof typeof batchData];
  const currentBatch = getCurrentBatch();

  return (
    <div className="min-h-screen bg-tathir-cream p-6 pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center items-center">
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
            <h1
              className={`text-4xl md:text-6xl font-bold text-tathir-maroon mb-4 ${bloxat.className}`}
            >
              Batch Details
            </h1>
          </div>
        </AnimatedSection>

        {/* Description */}
        <AnimatedSection>
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="">
              <div className="space-y-4 text-tathir-brown">
                {selectedBatch === "crash" ? (
                  ""
                ) : (
                  <p className="text-xl sm:text-xl lg:text-2xl font-bold jersey-10-regular leading-relaxed">
                    What does it take to ace the IBA Admission test??
                  </p>
                )}
                <p className="text-lg sm:text-xl lg:text-2xl jersey-10-regular leading-relaxed">
                  {selectedBatch === "crash"
                    ? `The Crash Course starts around one month or so before the IBA Admission test (a few weeks before BUP). The purpose of this course is to familiarize the aspirants with all of the common topics tested in the test, show the approaches and shortcuts to each, and prepare them for the final run within the very last moment. The classes are focused on the frequently tested questions in IBA and BUP so that we can ensure the passing bar in each section without going through hundreds of resources and theories. You also get one-month of access to tathirmichil.com to sit for topic tests, 1 vs 1 challenges, and live full-length mock tests that rank you against the best IBA candidates.`
                    : `Some people might say the best resource and a personal mentor.
                  Others might say a supportive peer network and regular mock
                  tests. What if I said you can get all of it and more... at one
                  place?!`}
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Batch Selection */}
        <AnimatedSection>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Filter className="text-tathir-maroon w-8 h-8" />
              <h2
                className={`text-2xl uppercase font-bold text-tathir-maroon ${bloxat.className}`}
              >
                Select Your Batch
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {Object.entries(batchData).map(([key, batch]) => (
                <button
                  key={key}
                  onClick={() => setSelectedBatch(key)}
                  className={`px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] 
                    [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                    ${bloxat.className} ${
                    selectedBatch === key
                      ? "bg-tathir-maroon text-tathir-beige"
                      : "bg-tathir-beige text-tathir-maroon hover:bg-tathir-cream"
                  }`}
                >
                  {batch.name}
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Batch Overview */}
        {/* <AnimatedSection>
          
        </AnimatedSection> */}

        {/* Features Grid */}
        <AnimatedSection>
          <div className="text-center space-y-8">
            <h2
              className={`text-3xl md:text-4xl font-bold text-tathir-maroon mb-6 mt-20 ${bloxat.className} uppercase`}
            >
              Batch Features
            </h2>
            <div
              className={`relative left-1/2 transform -translate-x-1/2 w-16 sm:w-24 lg:w-32 h-1 bg-gradient-to-r from-transparent via-tathir-maroon to-transparent`}
            ></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Classes */}
              <div
                className="group bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.02] transition-all duration-300 
                [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-30 transition-colors duration-300">
                    <BookOpen className="w-8 h-8 text-tathir-beige" />
                  </div>
                  <h3
                    className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className}`}
                  >
                    Classes
                  </h3>
                  <div
                    className={`text-3xl font-bold text-tathir-brown mb-2 jersey-10-regular`}
                  >
                    {currentBatch.features.classes}
                  </div>
                  <p className="text-xl jersey-10-regular text-tathir-brown">
                    {"classesPerMonth" in currentBatch.features &&
                      `${currentBatch.features.classesPerMonth} / month`}
                  </p>
                </div>
              </div>

              {/* Mock Tests */}
              <div
                className="group bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.02] transition-all duration-300 
                [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-30 transition-colors duration-300">
                    <Trophy className="w-8 h-8 text-tathir-beige" />
                  </div>
                  <h3
                    className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className}`}
                  >
                    Mock Tests
                  </h3>
                  <div
                    className={`text-3xl font-bold text-tathir-brown mb-2 jersey-10-regular`}
                  >
                    {currentBatch.features.mockTests}
                  </div>
                  <p className="text-xl jersey-10-regular text-tathir-brown">
                    Full-length tests
                  </p>
                </div>
              </div>

              {/* Fees */}
              <div
                className="group bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.02] transition-all duration-300 
                [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-30 transition-colors duration-300">
                    <Target className="w-8 h-8 text-tathir-beige" />
                  </div>
                  <h3
                    className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className}`}
                  >
                    Fees
                  </h3>
                  <div
                    className={`text-3xl font-bold text-tathir-brown mb-2 jersey-10-regular`}
                  >
                    {currentBatch.price.total}
                  </div>
                  {"note" in currentBatch.price && currentBatch.price.note && (
                    <p className="text-xl jersey-10-regular text-tathir-brown">
                      {currentBatch.price.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Format */}
              <div
                className="group bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.02] transition-all duration-300 
                [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-30 transition-colors duration-300">
                    <Video className="w-8 h-8 text-tathir-beige" />
                  </div>
                  <h3
                    className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className}`}
                  >
                    Format
                  </h3>
                  <div
                    className={`text-2xl font-bold text-tathir-brown mb-2 jersey-10-regular`}
                  >
                    {currentBatch.features.format}
                  </div>
                  <p className="text-xl jersey-10-regular text-tathir-brown">
                    Timing: {currentBatch.features.timing}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <About variant="batch" />

        {/* Key Highlights */}
        <div className="text-center space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Slide into Success */}
            <AnimatedSection>
              <div className="group h-full">
                <div
                  className="bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full flex flex-col
            [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
            hover:[box-shadow:4px_4px_0_#7a4f3a,8px_8px_0_#7a4f3a,12px_12px_0_#7a4f3a,16px_16px_0_#7a4f3a,20px_20px_0_#7a4f3a,24px_24px_1px_rgba(0,0,0,.1)]
            hover:bg-gradient-to-br hover:from-tathir-beige hover:to-tathir-cream-light"
                >
                  <div className="flex flex-col items-center text-center flex-grow">
                    <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-40 transition-all duration-500">
                      <BookOpen className="w-8 h-8 text-tathir-beige" />
                    </div>
                    <h4
                      className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className} group-hover:text-tathir-brown transition-colors duration-300`}
                    >
                      Slide into Success
                    </h4>
                    <p className="text-xl jersey-10-regular text-tathir-brown group-hover:text-tathir-maroon transition-colors duration-300 flex-grow">
                      I've worked hundreds of hours to make the class slides,
                      questions, notes, and materials for this course. These
                      will ensure that you have the best preparation possible
                      and are not missing out on anything. The classes are
                      entirely practice-based, designed to develop your basics
                      and enhance your aptitude.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Best Preparation */}
            <AnimatedSection>
              <div className="group h-full">
                <div
                  className="bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full flex flex-col
            [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
            hover:[box-shadow:4px_4px_0_#7a4f3a,8px_8px_0_#7a4f3a,12px_12px_0_#7a4f3a,16px_16px_0_#7a4f3a,20px_20px_0_#7a4f3a,24px_24px_1px_rgba(0,0,0,.1)]
            hover:bg-gradient-to-br hover:from-tathir-beige hover:to-tathir-cream-light"
                >
                  <div className="flex flex-col items-center text-center flex-grow">
                    <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-40 transition-all duration-500">
                      <Target className="w-8 h-8 text-tathir-beige" />
                    </div>
                    <h4
                      className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className} group-hover:text-tathir-brown transition-colors duration-300`}
                    >
                      Best Preparation
                    </h4>
                    <p className="text-xl jersey-10-regular text-tathir-brown group-hover:text-tathir-maroon transition-colors duration-300 flex-grow">
                      I've created a complete roadmap on the website with
                      well-defined steps so that you don't feel lost at any
                      point. Bug me all you want with your questions and
                      confusion, I'm happy to provide detailed guidance and
                      personal mentorship throughout the admission phase.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Mock Tests */}
            <AnimatedSection>
              <div className="group h-full">
                <div
                  className="bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full flex flex-col
            [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
            hover:[box-shadow:4px_4px_0_#7a4f3a,8px_8px_0_#7a4f3a,12px_12px_0_#7a4f3a,16px_16px_0_#7a4f3a,20px_20px_0_#7a4f3a,24px_24px_1px_rgba(0,0,0,.1)]
            hover:bg-gradient-to-br hover:from-tathir-beige hover:to-tathir-cream-light"
                >
                  <div className="flex flex-col items-center text-center flex-grow">
                    <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-40 transition-all duration-500">
                      <FileText className="w-8 h-8 text-tathir-beige" />
                    </div>
                    <h4
                      className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className} group-hover:text-tathir-brown transition-colors duration-300`}
                    >
                      Mock Tests
                    </h4>
                    <p className="text-xl jersey-10-regular text-tathir-brown group-hover:text-tathir-maroon transition-colors duration-300 flex-grow">
                      We're all about mock tests here. After each class, it's
                      time to put you through a class test and see if you
                      actually understood the techniques I discussed. You can
                      challenge your friend to a 1 vs 1 mock test and compete
                      for glory with our ranking system.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Best Resources */}
            <AnimatedSection>
              <div className="group h-full">
                <div
                  className="bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full flex flex-col
            [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
            hover:[box-shadow:4px_4px_0_#7a4f3a,8px_8px_0_#7a4f3a,12px_12px_0_#7a4f3a,16px_16px_0_#7a4f3a,20px_20px_0_#7a4f3a,24px_24px_1px_rgba(0,0,0,.1)]
            hover:bg-gradient-to-br hover:from-tathir-beige hover:to-tathir-cream-light"
                >
                  <div className="flex flex-col items-center text-center flex-grow">
                    <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-40 transition-all duration-500">
                      <Calendar className="w-8 h-8 text-tathir-beige" />
                    </div>
                    <h4
                      className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className} group-hover:text-tathir-brown transition-colors duration-300`}
                    >
                      Best Resources
                    </h4>
                    <p className="text-xl jersey-10-regular text-tathir-brown group-hover:text-tathir-maroon transition-colors duration-300 flex-grow">
                      Beyond the well-curated slides, I will provide all the
                      best resources on our dedicated website. Everything you
                      need, all in one place, all as handy PDFs. You will not
                      miss out on anything.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Sessions */}
            <AnimatedSection>
              <div className="group h-full">
                <div
                  className="bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full flex flex-col
            [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
            hover:[box-shadow:4px_4px_0_#7a4f3a,8px_8px_0_#7a4f3a,12px_12px_0_#7a4f3a,16px_16px_0_#7a4f3a,20px_20px_0_#7a4f3a,24px_24px_1px_rgba(0,0,0,.1)]
            hover:bg-gradient-to-br hover:from-tathir-beige hover:to-tathir-cream-light"
                >
                  <div className="flex flex-col items-center text-center flex-grow">
                    <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-40 transition-all duration-500">
                      <Video className="w-8 h-8 text-tathir-beige" />
                    </div>
                    <h4
                      className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className} group-hover:text-tathir-brown transition-colors duration-300`}
                    >
                      Sessions
                    </h4>
                    <p className="text-xl jersey-10-regular text-tathir-brown group-hover:text-tathir-maroon transition-colors duration-300 flex-grow">
                      Get regular sessions to address your specific questions
                      and receive personalized guidance. Don't miss our casual
                      group sessions where I provide valuable insights,
                      strategies, tips, and tricks.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Community Building */}
            <AnimatedSection>
              <div className="group h-full">
                <div
                  className="bg-tathir-beige rounded-xl p-8 transform hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full flex flex-col
            [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
            hover:[box-shadow:4px_4px_0_#7a4f3a,8px_8px_0_#7a4f3a,12px_12px_0_#7a4f3a,16px_16px_0_#7a4f3a,20px_20px_0_#7a4f3a,24px_24px_1px_rgba(0,0,0,.1)]
            hover:bg-gradient-to-br hover:from-tathir-beige hover:to-tathir-cream-light"
                >
                  <div className="flex flex-col items-center text-center flex-grow">
                    <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-4 rounded-lg mb-6 group-hover:bg-opacity-40 transition-all duration-500">
                      <Users className="w-8 h-8 text-tathir-beige" />
                    </div>
                    <h4
                      className={`text-xl uppercase font-bold text-tathir-maroon mb-4 ${bloxat.className} group-hover:text-tathir-brown transition-colors duration-300`}
                    >
                      Community Building
                    </h4>
                    <p className="text-xl jersey-10-regular text-tathir-brown group-hover:text-tathir-maroon transition-colors duration-300 flex-grow">
                      Be the part of THE BEST community when it comes to IBA
                      admissions. The MICHIL! Become a part of our group chat
                      with like-minded aspirants. Discuss problems, rant about
                      mocks, make friends, and have fun in the process.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Testimonials Section */}
        <AnimatedSection>
          <div className="text-center space-y-8">
            <Testimonials variant="batch" />
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection>
          <div className="text-center space-y-8">
            <h2
              className={`text-3xl md:text-4xl font-bold text-tathir-maroon mb-8 ${bloxat.className} uppercase`}
            >
              Ready to Start Your IBA Journey?
            </h2>
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href={`/form`}
                  className={`group px-10 py-5 bg-tathir-maroon text-tathir-beige font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] 
                    [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                    inline-flex items-center justify-center gap-2 relative overflow-hidden ${bloxat.className}`}
                >
                  <span className="flex items-center justify-center uppercase relative z-10 text-lg">
                    Enroll in {currentBatch.name}
                    <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Link>
                <Link
                  href="/classes"
                  className={`group px-10 py-5 bg-tathir-beige text-tathir-maroon font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] 
                    [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                    inline-flex items-center justify-center gap-2 relative overflow-hidden ${bloxat.className}`}
                >
                  <span className="flex items-center justify-center uppercase relative z-10 text-lg">
                    View Curriculum
                    <BookOpen className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Link>
              </div>
              <p className="text-xl jersey-10-regular text-tathir-brown">
                Have questions?{" "}
                <Link
                  href="https://www.facebook.com/share/1C6HSoet3V/?mibextid=wwXIfr"
                  className="text-tathir-maroon hover:text-tathir-brown underline font-bold"
                >
                  DM me
                </Link>{" "}
                for more information.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
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

export default BatchPage;
