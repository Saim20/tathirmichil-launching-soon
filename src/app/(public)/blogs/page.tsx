"use client";

import BlogCard from "@/components/BlogCard";
import { getPublicBlogs, Blog } from "@/lib/apis/blogs";
import { useEffect, useState } from "react";
import { Search, Filter, BookOpen, Home } from "lucide-react";
import { bloxat } from "@/components/fonts";
import { extractTextContent } from "@/lib/utils/contentProcessor";
import useInView from "../../../lib/utils";
import Link from "next/link";

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deadEnd, setDeadEnd] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tags = ["All", "Math", "English", "Analytical", "Written", "Tips"];

  const fetchBlogs = async (prevBlogs: Blog[] = []) => {
    try {
      const toFetch = 6;
      setLoading(true);
      
      // Only reset deadEnd if this is a "load more" operation with existing blogs
      if (prevBlogs.length > 0) {
        setDeadEnd(false);
      }
      
      const response = await getPublicBlogs(prevBlogs, toFetch);

      if (!response.success || !response.data) {
        console.error("Error fetching blogs:", response.error);
        setDeadEnd(true);
        return;
      }

      const newBlogs = response.data;
      console.log(`Fetched ${newBlogs.length} blogs, expected ${toFetch}`);
      console.log('Current blogs count:', prevBlogs.length);
      console.log('Total blogs after fetch:', prevBlogs.length + newBlogs.length);
      
      // Only set deadEnd if we get 0 blogs, or if this is a "load more" operation and we get fewer than expected
      if (newBlogs.length === 0 || (prevBlogs.length > 0 && newBlogs.length < toFetch)) {
        setDeadEnd(true);
      }

      // If prevBlogs is empty, this is the initial load
      if (prevBlogs.length === 0) {
        setBlogs(newBlogs);
      } else {
        // Otherwise, append new blogs to existing ones
        setBlogs(prev => [...prev, ...newBlogs]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setDeadEnd(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    const matchesTag =
      selectedTag.toLowerCase() === "all" ||
      blog.tags?.includes(selectedTag.toLowerCase());

    // Search both HTML/Markdown content and text content for better matching
    const titleText = extractTextContent(blog.title).toLowerCase();
    const contentText = extractTextContent(blog.content).toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      titleText.includes(query) ||
      contentText.includes(query) ||
      blog.title.toLowerCase().includes(query) ||
      blog.content.toLowerCase().includes(query);

    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-tathir-cream p-6 pb-16">
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        
        {/* Header */}
        <AnimatedSection>
          <div className="text-center">
            <Link href="/" 
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
              Blogs
            </h1>
          </div>
        </AnimatedSection>

        {/* Search and Filter */}
        {/* <AnimatedSection>
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-tathir-beige text-tathir-brown border-2 border-tathir-brown/20 rounded-xl 
                    focus:outline-none focus:border-tathir-maroon transition-colors text-lg
                    [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a]"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-tathir-brown/50" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-tathir-maroon">
                <Filter className="h-6 w-6" />
                <span
                  className={`font-bold text-lg ${bloxat.className} uppercase`}
                >
                  Filter:
                </span>
              </div>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag.toLowerCase())}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] 
                    [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                    ${bloxat.className} uppercase ${
                    selectedTag.toLowerCase() === tag.toLowerCase()
                      ? "bg-tathir-maroon text-tathir-beige"
                      : "bg-tathir-beige text-tathir-maroon hover:bg-tathir-cream"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection> */}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog, index) => (
            <AnimatedSection key={blog.id}>
              <BlogCard blog={blog} />
            </AnimatedSection>
          ))}
        </div>

        {/* Load More Button */}
        {!deadEnd && (
          <AnimatedSection>
            <div className="text-center">
              <button
                onClick={() => fetchBlogs(blogs)}
                disabled={loading}
                className={`px-10 py-5 bg-tathir-maroon text-tathir-beige font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] 
                  [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
                  disabled:opacity-50 disabled:cursor-not-allowed ${bloxat.className} uppercase text-lg relative overflow-hidden group`}
              >
                <span className="relative z-10">
                  {loading ? "Loading..." : "Load More"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </AnimatedSection>
        )}

        {/* No Results Message */}
        {filteredBlogs.length === 0 && !loading && (
          <AnimatedSection>
            <div className="text-center py-12">
              <div
                className="bg-tathir-beige rounded-xl p-8 
                [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]"
              >
                <BookOpen className="w-16 h-16 text-tathir-maroon mx-auto mb-4" />
                <h3
                  className={`text-2xl font-bold text-tathir-maroon mb-2 ${bloxat.className} uppercase`}
                >
                  No Blogs Found
                </h3>
                <p className="text-tathir-brown jersey-10-regular text-lg">
                  Try adjusting your search or filter criteria to find more
                  articles.
                </p>
              </div>
            </div>
          </AnimatedSection>
        )}
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

export default BlogPage;
