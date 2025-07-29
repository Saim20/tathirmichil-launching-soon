"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  BookOpen,
  Calculator,
  PenTool,
  Brain,
  FileText,
  Target,
  ChevronDown,
  ChevronUp,
  Home,
} from "lucide-react";
import { bloxat } from "@/components/fonts";
import useInView from "../../lib/utils";
import Link from "next/link";

const ClassesPage = () => {
  const [selectedBatch, setSelectedBatch] = useState("regular");
  const [expandedClasses, setExpandedClasses] = useState<
    Record<number, boolean>
  >({});

  const batchTypes = ["Regular", "Crash"];

  const toggleExpanded = (classId: number) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  const getTopicIcon = (topic: string) => {
    switch (topic.toLowerCase()) {
      case "math":
        return <Calculator className="w-6 h-6 text-tathir-beige" />;
      case "english":
        return <PenTool className="w-6 h-6 text-tathir-beige" />;
      case "analytical":
        return <Brain className="w-6 h-6 text-tathir-beige" />;
      case "written":
        return <FileText className="w-6 h-6 text-tathir-beige" />;
      case "strategy":
        return <Target className="w-6 h-6 text-tathir-beige" />;
      case "orientation":
        return <BookOpen className="w-6 h-6 text-tathir-beige" />;
      default:
        return <BookOpen className="w-6 h-6 text-tathir-beige" />;
    }
  };

  const regularClasses = [
    {
      id: 1,
      title: "Orientation & Roadmap",
      description:
        "The first class sets the stage. We start with quick introductions and talk about our interests. I give you a clear picture of life at IBA and explain how the admission test really works. From my own journey of ranking first to mentoring hundreds for the IBA admissions, I break down the test structure, key topics, essential resources, and common pitfalls. I'll explain my teaching methods, the features of this website, and how to utilize them to the fullest. We wrap up with a detailed three month roadmap that shows exactly what to study, where to practice, and how we will track progress.",
      topic: "orientation",
      duration: "2h+",
    },
    {
      id: 2,
      title: "Math Fundamentals",
      description:
        "Addition, Subtraction, Multiplication, and Division – All of mathematics relies on these four basic operations. In this class, we'll learn how to use these to solve each question within seconds. We'll talk about mental math techniques, back-calculating an answer from the given options, finding the right answer without solving the problem by approximation and assumption technique. Basically, we'll cover the tricks and shortcuts that can boost your math skills before we dive into each topic individually.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 3,
      title: "Grammar",
      description:
        "In our first English class, we'll go through all the common grammar concepts tested frequently so that you don't have to rely solely on your intuition anymore.",
      topic: "english",
      duration: "2h+",
    },
    {
      id: 4,
      title: "Equation Building- Work, Age, Average, and Other Word Problems.",
      description:
        "The most important skill to ace the math section is being able to create a simple equation out of a complex quant problem. In this class, we learn to convert each word problem into a simple equation through template formats, formulas, and a fundamental understanding of the topics.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 5,
      title: "Numbers",
      description:
        "The numbers should play in your head. Is 337 a prime number? What's the unit digit of 34^34 × 1347? In this class, we'll go through primes, divisibility checks, LCM, HCF, fractions, decimals, common value tricks, unit-digits, exponents, and more.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 6,
      title: "Percentage, Profit-Loss & Interest",
      description:
        "Per cent means per hundred. Profit loss, interest, or anything that has to do with percentages can be solved easily if you intuitively understand how percentage works. In this class, we'll go through the simple methods of figuring out the percentage, cost price, selling price, simple or compound interest, etc, so that you can secure some easy marks and ensure the passing bar in maths.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 7,
      title: "Vocabulary",
      description:
        "Vocabulary itself is enough to secure the passing bar in English. But memorizing thousands of words might seem draining. That's why, in this class, we'll discuss how to remember the words effortlessly, approach sentence completion by figuring out the clues given in the question, understand the relationships shown in analogy questions, or answer a cloze test. I'll also provide the best vocabulary lists for you to practice.",
      topic: "english",
      duration: "2h+",
    },
    {
      id: 8,
      title: "Error Detection",
      description:
        "Error Detection is kinda repetitive (and easy). There are only a handful of concepts, and once you solve enough questions, the same patterns keep repeating over and over again. In this class, I'll present all the frequent patterns in the IBA admission test and show how to identify and answer each one easily.",
      topic: "english",
      duration: "2h+",
    },
    {
      id: 9,
      title: "Sentence Correction",
      description:
        "Five options. Only one is grammatically correct. So, rather than figuring out the right one, we go through the process of elimination. In this class, we discuss the common mistakes that make an option grammatically incorrect. Same as ED, we go through the frequent patterns tested in SC, such as: Modifier error, Subject Verb Agreement, Parallelism, etc.",
      topic: "english",
      duration: "2h+",
    },
    {
      id: 10,
      title: "Puzzles",
      description:
        "Puzzles are fun. Read the conditions once, noting every fact. Draw a clean diagram to map the relationships. Extract any extra rules the diagram reveals. Eliminate options until the answer remains. Seating, Mapping, Zebra… I'll go through all the puzzle types and show you the best way of tackling them in the test.",
      topic: "analytical",
      duration: "2h+",
    },
    {
      id: 11,
      title: "Ratio, Mixture & Partnership",
      description:
        "What's the difference between Ratio and Proportion? What's the resulting concentration when you mix a 100 ml 20 % salt-water with 200 ml 40 %? How do you divide the profit amongst friends who invested different amounts for different periods? In this class, We'll solve these problems easily.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 12,
      title: "Speed, Distance & Time, and Miscellaneous.",
      description:
        "Two trains are coming from opposite directions, one running at 20 km/h and the other at 25. What's their relative speed? Relative speed is my favourite concept to teach. Karon ami chatgaiya.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 13,
      title: "Permutation, Combination, Probability, and Set",
      description:
        "In this class, we count the possibilities. What's the probability that you'll be selected as the CR of your batch? If all of this class shakes hands with one another, how many handshakes will there be in total? What's the probability that you'll get into IBA? I'll show you when to use permutations, when to switch to combinations, how to use simple set formulas within seconds, and how to measure the probability of anything.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 14,
      title: "Angles, Triangles & Circles",
      description:
        'In this class, you\'ll see me struggling to pronounce "Isosceles triangle".',
      topic: "math",
      duration: "2h+",
    },
    {
      id: 15,
      title: "Solid & Coordinate Geometry",
      description:
        "Volumes, surface areas, and straight-line basics that can boost your math scores quite a bit. In this class, we'll walk through every formula for volume, surface area, slope, distance, and intersection, then solve enough examples so that you can call the right one without thinking.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 16,
      title: "Critical Reasoning",
      description:
        "Each question hands you a short argument with a premise and a conclusion. Your task is to catch the hidden assumption, point out the flaw, or pick the statement that strengthens or weakens the case. In this class, I'll cover frequently tested patterns such as boldface, paradox, analogy, cause-effect. If you know what type of CR it is, the process becomes simple and easy.",
      topic: "analytical",
      duration: "2h+",
    },
    {
      id: 17,
      title: "Reading Comprehension",
      description:
        "There's no guarantee that you'll have ED or SC in the IBA exam. But you'll get at least one passage for sure. In this class, we'll ensure that we don't miss out on these 5-10 marks. I'll discuss how to approach each passage, figure out the main idea or author's purpose for each paragraph, spot the inference, etc.",
      topic: "english",
      duration: "2h+",
    },
    {
      id: 18,
      title: "Para Completion, Para Summary & Para Jumbles",
      description:
        'These topics were hardly ever taught or practiced earlier. But recent IBA question papers show how important these "miscellaneous" concepts can be. In this class, we go through sequential texts and predict the logical flow without having to reread. Just a few signal words and grammatical cues can tell you the answer.',
      topic: "english",
      duration: "2h+",
    },
    {
      id: 19,
      title: "Data Sufficiency",
      description:
        "You'll be given a question. Ex: \"what is the value of K?\". Then, you'll be given two statements that provide information related to the question. You have to answer whether the statements are sufficient to answer the question. Data sufficiency is easy once know the right approach. In this class, we'll go through those.",
      topic: "analytical",
      duration: "2h+",
    },
    {
      id: 20,
      title: "Writing",
      description:
        "The writing section contains 30 marks and an individual passing bar. Last few years, many of the candidates have failed to get into IBA even after acing the MCQ part, cause they fell short by 1 mark in writing. So in this class, I'll teach you how to write an argumentative essay while maintaining the proper structure, grammar, and punctuation. I'll also discuss how to brainstorm ideas for descriptive writing and ensure enough marks to pass.",
      topic: "written",
      duration: "2h+",
    },
    {
      id: 21,
      title: "Exam Hall Strategy",
      description:
        "Based on the survey I did of current IBA students for my Bus.Stat course, Time management and Nerve management are the biggest determinants of success in the IBA admission test. You get ninety minutes and only one shot at the IBA admission test. This class is about using every second well. What to do right before the test? How much time should you allocate for each section? Which questions do you attempt first? Which questions should you skip? How many questions should you answer? Given my experience of topping almost every test during my prep, ranking 1st in IBA, and mentoring dozens of other IBAites, I'll make sure that you follow the best strategies for each section of the test. No worries!",
      topic: "strategy",
      duration: "2h+",
    },
  ];

  const crashClasses = [
    {
      id: 1,
      title: "BUP Math Masterclass",
      description:
        "There's a slight difference in the question standard and type in BUP and IBA admission tests. So, for the crash course, I've divided the classes under separate names for convenience, even though one will obviously help the other.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 2,
      title: "IBA Math Masterclass",
      description:
        "Every important formula, shortcut, and pattern that shows up in IBA. We cover the usual numbers, percentage, word problems, and geometry, then dive into topics such as race and games, pipes and cisterns, and partnership that most people skip. This might take more than one lecture.",
      topic: "math",
      duration: "2h+",
    },
    {
      id: 3,
      title: "BUP English Masterclass",
      description:
        'BUP English section is somewhat GRE Verbal Ability based. And BUP te questions common ashe! We\'ll go through this section in detail and show you the right resources to "cram" before BUP.',
      topic: "english",
      duration: "2h+",
    },
    {
      id: 4,
      title: "IBA English Masterclass",
      description:
        "Unlike BUP, the English section of IBA is more intuitive and requires you to have a diverse foundation in order to secure the passing bar. In this class, I won't go through long list of boring grammar rules, but only teach you the small bits of each frequent topic that can significantly improve your score across easy sections such as ED, Para Jumbles, Sentence Completion, etc.",
      topic: "english",
      duration: "2h+",
    },
    {
      id: 5,
      title: "Analytical Ability Masterclass",
      description:
        "Puzzles, critical reasoning, data sufficiency. I'll go through each question type and their best approach to make sure that you secure the passing bar in analytical without a sweat.",
      topic: "analytical",
      duration: "2h+",
    },
    {
      id: 6,
      title: "Writing",
      description:
        "The writing section contains 30 marks and an individual passing bar. Last few years, many of the candidates have failed to get into IBA even after acing the MCQ part, cause they fell short by 1 mark in writing. So in this class, I'll teach you how to write an argumentative essay while maintaining the proper structure, grammar, and punctuation. I'll also discuss how to brainstorm ideas for descriptive writing and ensure enough marks to pass.",
      topic: "written",
      duration: "2h+",
    },
    {
      id: 7,
      title: "Exam Hall Strategy",
      description:
        "Based on the survey I did of current IBA students for my Bus.Stat course, Time management and Nerve management are the biggest determinants of success in the IBA admission test. You get ninety minutes and only one shot at the IBA admission test. This class is about using every second well. What to do right before the test? How much time should you allocate for each section? Which questions do you attempt first? Which questions should you skip? How many questions should you answer? Given my experience of topping almost every test during my prep, ranking 1st in IBA, and mentoring dozens of other IBAites, I'll make sure that you follow the best strategies for each section of the test. No worries!",
      topic: "strategy",
      duration: "2h+",
    },
  ];

  const currentClasses =
    selectedBatch === "regular" ? regularClasses : crashClasses;

  const getPreviewText = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-tathir-cream p-6 pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center">
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
              className={`text-4xl md:text-6xl font-bold text-tathir-maroon mb-4 ${bloxat.className} uppercase`}
            >
              Course Curriculum
            </h1>
            <p className="text-xl jersey-10-regular text-tathir-brown max-w-3xl mx-auto leading-relaxed">
              Throughout my course, we follow this golden formula for each
              topic: Learn. Practice. Test. You start by learning the core ideas
              in class: concepts, formulas, shortcuts, and approaches. Right
              after the class, there’s a quick test to check how much of it you
              actually learned. During the week, you practice the same topic
              with the topic-wise practice sets on our website. Each Friday, we
              hold a live mock on the assigned topics with a leaderboard so you
              can see exactly where you stand. We keep rolling through the
              entire IBA syllabus in this flow until every topic feels familiar.
            </p>
          </div>
        </AnimatedSection>

        {/* Batch Selector */}
        <AnimatedSection>
          <div className="flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {batchTypes.map((batch) => (
                <button
                  key={batch}
                  onClick={() => setSelectedBatch(batch.toLowerCase())}
                  className={`px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] 
                    [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                    ${bloxat.className} uppercase ${
                    selectedBatch === batch.toLowerCase()
                      ? "bg-tathir-maroon text-tathir-beige"
                      : "bg-tathir-beige text-tathir-maroon hover:bg-tathir-cream"
                  }`}
                >
                  {batch} Batch
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Class List */}
        <div className="space-y-4">
          {currentClasses.map((classItem, index) => (
            <AnimatedSection key={classItem.id}>
              <div
                className="group bg-tathir-beige rounded-xl p-6 transform hover:scale-[1.01] transition-all duration-300 
                  [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-tathir-maroon bg-opacity-20 backdrop-blur-sm p-2 rounded-lg group-hover:bg-opacity-30 transition-colors duration-300 flex-shrink-0">
                    {getTopicIcon(classItem.topic)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-lg uppercase font-bold text-tathir-maroon mb-2 ${bloxat.className} leading-tight`}
                    >
                      Class {index + 1}: {classItem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-tathir-brown/70">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {classItem.duration}
                      </span>
                      <span className="capitalize bg-tathir-cream px-3 py-1 rounded-full text-tathir-dark-green font-bold jersey-10-regular text-xs">
                        {classItem.topic}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-tathir-brown">
                  {expandedClasses[classItem.id] ? (
                    <div>
                      <p className="text-lg jersey-10-regular leading-relaxed mb-3">
                        {classItem.description}
                      </p>
                      <button
                        onClick={() => toggleExpanded(classItem.id)}
                        className="flex items-center gap-1 text-tathir-maroon hover:text-tathir-brown font-bold transition-colors 
                          px-3 py-1 rounded-lg bg-tathir-cream hover:bg-tathir-beige text-sm"
                      >
                        <ChevronUp className="w-4 h-4" />
                        Read less
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg jersey-10-regular leading-relaxed mb-3">
                        {getPreviewText(classItem.description)}
                      </p>
                      {classItem.description.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(classItem.id)}
                          className="flex items-center gap-1 text-tathir-maroon hover:text-tathir-brown font-bold transition-colors 
                            px-3 py-1 rounded-lg bg-tathir-cream hover:bg-tathir-beige text-sm"
                        >
                          <ChevronDown className="w-4 h-4" />
                          Read more
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Additional Information */}
        <AnimatedSection>
          <div className="text-center space-y-8">
            <h2
              className={`text-3xl md:text-4xl font-bold text-tathir-maroon mb-4 mt-15 ${bloxat.className} uppercase`}
            >
              Additional Information
            </h2>
            <div
              className="bg-tathir-beige rounded-xl p-8 
              [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
            >
              <div className="text-tathir-brown space-y-6">
                {selectedBatch === "regular" ? (
                  <p className="text-xl jersey-10-regular leading-relaxed">
                    We'll have 8 classes per month and 24 classes in this course
                    (atleast). You can see 21 of them listed above. Some of
                    these classes will take more than one lecture. Later, I'll
                    also add some new lectures as per your needs. Trust the
                    process. Be consistent. If you follow my guidelines to the
                    point, I believe you'll ace every test you encounter.
                  </p>
                ) : (
                  <>
                    <p className="text-xl jersey-10-regular leading-relaxed">
                      The Crash Course starts around one month or so before the
                      IBA Admission test (a few weeks before BUP). The purpose
                      of this course is to familiarize the aspirants with all of
                      the common topics tested in the test, show the approaches
                      and shortcuts to each, and prepare them for the final run
                      within the very last moment. The classes are focused on
                      the frequently tested questions in IBA and BUP so that we
                      can ensure the passing bar in each section without going
                      through hundreds of resources and theories. You also get
                      one-month of access to tathirmichil.com to sit for topic
                      tests, 1 vs 1 challenges, and live full-length mock tests
                      that rank you against the best IBA candidates.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Call to Action */}
        <AnimatedSection>
          <div className="text-center space-y-8">
            <h2
              className={`text-3xl md:text-4xl font-bold text-tathir-maroon mb-0 mt-15 ${bloxat.className} uppercase`}
            >
              Ready to Start Your IBA Journey?
            </h2>
            <div className=" rounded-xl p-4 ">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  {currentClasses === regularClasses ? (
                    <a
                      href="/form"
                      className={`group px-10 py-5 bg-tathir-maroon text-tathir-beige font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] 
                      [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                      inline-flex items-center justify-center gap-2 relative overflow-hidden ${bloxat.className}`}
                    >
                      <span className="flex items-center justify-center uppercase relative z-10 text-lg">
                        Enroll Now
                        <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </a>
                  ) : (
                    <></>
                  )}
                  <a
                    href="/batch"
                    className={`group px-10 py-5 bg-tathir-beige text-tathir-maroon font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] 
                      [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                      inline-flex items-center justify-center gap-2 relative overflow-hidden ${bloxat.className}`}
                  >
                    <span className="flex items-center justify-center uppercase relative z-10 text-lg">
                      Learn More
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </a>
                </div>
              </div>
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

export default ClassesPage;
