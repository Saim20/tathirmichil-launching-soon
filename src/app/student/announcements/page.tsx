"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/lib/auth/auth-provider";
import { db } from "@/lib/firebase/firebase";
import { FaSpinner, FaGlobe, FaUsers, FaLock, FaBullhorn } from "react-icons/fa";
import { getStudentBatch, getPostsForStudent, Post } from "@/lib/apis/posts";
import { getDefaultUser } from "@/lib/apis/users";
import { bloxat } from "@/components/fonts";

export default function StudentAnnouncementsPage() {
  const { user } = useContext(AuthContext)!;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBatchAndPosts() {
      if (!user || !user.email) return;
      setLoading(true);
      setError(null);
      try {
        const studentResponse = await getDefaultUser();
        if (!studentResponse.success || !studentResponse.data) {
          setError(studentResponse.error || "Failed to load user data");
          return;
        }

        const postsResponse = await getPostsForStudent(studentResponse.data);
        if (!postsResponse.success || !postsResponse.data) {
          setError(postsResponse.error || "Failed to load posts");
          return;
        }

        setPosts(postsResponse.data);
      } catch (err) {
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchBatchAndPosts();
  }, [user]);

  return (
    <div className="bg-tathir-beige min-h-screen pb-16 pt-6 px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[35rem] h-[35rem] bg-tathir-maroon/10 rounded-full blur-3xl -top-24 -right-24 animate-pulse"></div>
        <div className="absolute w-[25rem] h-[25rem] bg-tathir-brown/10 rounded-full blur-3xl bottom-0 left-0 animate-pulse delay-1000"></div>
        <div className="absolute w-[20rem] h-[20rem] bg-tathir-dark-green/10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-tathir-maroon via-tathir-brown to-tathir-dark-green opacity-20 blur-lg transform scale-110"></div>
            <h1 className={`text-4xl uppercase font-bold tracking-wider relative text-tathir-dark-green ${bloxat.className}`}>
              Announcements
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FaSpinner className="text-tathir-dark-green text-4xl animate-spin mb-4" />
            <p className={`text-xl text-tathir-dark-green ${bloxat.className}`}>Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border-2 border-red-600 rounded-lg p-6 text-center">
            <p className="text-red-300 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <FaBullhorn className="text-tathir-dark-green/30 text-6xl mx-auto mb-4" />
            <p className={`text-xl text-tathir-dark-green ${bloxat.className}`}>No announcements yet</p>
            <p className="text-tathir-brown mt-2">Check back later for updates!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="bg-tathir-cream border-2 border-tathir-maroon rounded-lg p-6 
                         shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.5)]
                         transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className={`inline-flex items-center justify-center w-12 h-12 rounded-lg 
                                ${post.type === "everyone" ? "bg-tathir-light-green/20" : 
                                  post.type === "batch" ? "bg-tathir-brown/20" : 
                                  "bg-tathir-maroon/20"} 
                                text-2xl`}>
                    {post.type === "everyone" ? (
                      <FaGlobe className="text-tathir-light-green" />
                    ) : post.type === "batch" ? (
                      <FaUsers className="text-tathir-brown" />
                    ) : (
                      <FaLock className="text-tathir-maroon" />
                    )}
                  </span>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-tathir-brown">
                      <span className="font-medium">
                        {post.type === "everyone" ? "Everyone" : 
                         post.type === "batch" ? `Batch: ${post.value}` : 
                         "Private"}
                      </span>
                      <span>•</span>
                      <span>
                        {post.createdAt instanceof Date
                          ? post.createdAt.toLocaleString()
                          : new Date((post.createdAt as any).seconds * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-tathir-dark-green whitespace-pre-line jersey-10-regular leading-relaxed">
                  {post.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
