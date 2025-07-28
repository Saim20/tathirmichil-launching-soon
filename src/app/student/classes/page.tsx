"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { FaPlay, FaCoins, FaLock, FaSearch, FaFilter, FaStar, FaSpinner } from "react-icons/fa";
import { AuthContext } from "@/lib/auth/auth-provider";
import { UserProfile } from "@/lib/apis/users";
import { InfoCard } from "@/components/shared/data/InfoCard";
import { bloxat } from "@/components/fonts";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { LoadingSpinner } from "@/components/shared/ui/LoadingSpinner";

interface ClassVideo {
  id: string;
  title: string;
  description: string;
  price: number;
  cloudflareVideoId: string;
  thumbnailUrl?: string;
  duration?: number;
  uploadedAt: Date;
  category: string;
  tags: string[];
  isActive: boolean;
  totalViews: number;
  totalPurchases: number;
}

export default function StudentClassesPage() {
  const [videos, setVideos] = useState<ClassVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const router = useRouter();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { user, userProfile, coinBalance, coinData } = authContext;

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      const token = user ? await user.getIdToken() : null;
      const response = await fetch('/student/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handlePurchase = async (videoId: string) => {
    if (coinBalance < 100) {
      alert("You don't have enough coins to purchase this video!");
      return;
    }

    setPurchasing(videoId);
    try {
      const token = user ? await user.getIdToken() : null;
      const response = await fetch('/student/api/classes/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId }),
      });

      if (response.ok) {
        // The user profile will be updated via the auth context listener
        alert("Video purchased successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Purchase failed. Please try again.");
      }
    } catch (error) {
      console.error('Error purchasing video:', error);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  const handleWatchVideo = (videoId: string) => {
    router.push(`/student/classes/watch/${videoId}`);
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory && video.isActive;
  });

  const categories = ["all", ...Array.from(new Set(videos.map(v => v.category)))];

  return (
    <div className="min-h-screen bg-tathir-beige p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-3xl md:text-4xl font-bold text-tathir-dark-green mb-4 ${bloxat.className}`}>
            Class Recordings
          </h1>
          <p className="text-lg text-tathir-brown">
            Purchase and watch class recordings using your Michilcoins
          </p>
        </div>

        {/* Coin Balance Card */}
        <InfoCard
          title="Your Balance"
          variant="student"
          icon={<FaCoins className="text-tathir-maroon" />}
          content={
            <div className="flex items-center justify-between">
              <div>
                <p className="text-tathir-brown">
                  Available to spend on video content
                </p>
                <p className="text-sm text-tathir-brown/70">
                  Each video costs 100 Michilcoins
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <FaCoins className="text-tathir-maroon text-xl" />
                  <span className={`text-3xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                    {coinBalance}
                  </span>
                </div>
                <p className="text-sm text-tathir-brown">Michilcoins</p>
              </div>
            </div>
          }
        />

        {/* Search and Filter */}
        <InfoCard
          title="Search & Filter"
          variant="student"
          content={
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3 text-tathir-brown/50" />
                <input
                  type="text"
                  placeholder="Search videos by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-tathir-brown/20 rounded-lg focus:border-tathir-maroon focus:outline-none transition-colors bg-tathir-cream"
                />
              </div>
              <div className="relative">
                <FaFilter className="absolute left-3 top-3 text-tathir-brown/50" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border-2 border-tathir-brown/20 rounded-lg focus:border-tathir-maroon focus:outline-none transition-colors bg-tathir-cream"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          }
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            title="Available Videos"
            variant="student"
            icon={<FaPlay className="text-tathir-dark-green" />}
            content={
              <div className="text-center">
                <span className={`text-3xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                  {filteredVideos.length}
                </span>
                <p className="text-sm text-tathir-brown/70 mt-1">
                  Videos matching your search
                </p>
              </div>
            }
          />
          
          <InfoCard
            title="Purchased Videos"
            variant="student"
            icon={<FaStar className="text-tathir-maroon" />}
            content={
              <div className="text-center">
                <span className={`text-3xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                  {userProfile?.purchasedVideos?.length || 0}
                </span>
                <p className="text-sm text-tathir-brown/70 mt-1">
                  Videos you own
                </p>
              </div>
            }
          />
          
          <InfoCard
            title="Total Balance"
            variant="student"
            icon={<FaCoins className="text-tathir-maroon" />}
            content={
              <div className="text-center">
                <span className={`text-3xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                  {coinBalance}
                </span>
                <p className="text-sm text-tathir-brown/70 mt-1">
                  Michilcoins available
                </p>
              </div>
            }
          />
        </div>

        {/* Videos Grid */}
        <InfoCard
          title="Available Videos"
          variant="student"
          content={
            filteredVideos.length === 0 ? (
              <EmptyState
                title="No videos found"
                description="Try adjusting your search or filter criteria"
                icon={<FaPlay className="text-6xl text-tathir-brown/30" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => {
                  const isPurchased = userProfile?.purchasedVideos?.includes(video.id) || false;
                  const canAfford = coinBalance >= video.price;
                  
                  return (
                    <div key={video.id} className="bg-tathir-cream rounded-lg overflow-hidden border-2 border-tathir-brown/20 hover:border-tathir-brown hover:shadow-lg transition-all">
                      {/* Thumbnail */}
                      <div className="h-48 bg-tathir-beige relative flex items-center justify-center">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaPlay className="text-6xl text-tathir-brown/30" />
                        )}
                        {!isPurchased && (
                          <div className="absolute inset-0 bg-tathir-dark-green/70 flex items-center justify-center backdrop-blur-sm">
                            <FaLock className="text-tathir-cream text-4xl" />
                          </div>
                        )}
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-tathir-dark-green/90 text-tathir-cream px-2 py-1 rounded text-sm">
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <h3 className={`font-bold text-tathir-dark-green mb-2 line-clamp-2 ${bloxat.className}`}>
                          {video.title}
                        </h3>
                        <p className="text-tathir-brown text-sm mb-3 line-clamp-2">
                          {video.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-tathir-beige border border-tathir-brown/20 text-tathir-dark-green px-2 py-1 rounded text-xs font-medium">
                            {video.category}
                          </span>
                          <span className="bg-tathir-maroon text-tathir-cream px-2 py-1 rounded text-xs flex items-center gap-1 font-medium">
                            <FaCoins className="text-xs" />
                            {video.price}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {video.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="bg-tathir-brown/10 text-tathir-brown px-2 py-1 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Action Button */}
                        {isPurchased ? (
                          <button
                            onClick={() => handleWatchVideo(video.id)}
                            className={`w-full bg-tathir-dark-green text-tathir-cream py-3 px-4 rounded-lg hover:bg-tathir-brown transition-colors flex items-center justify-center gap-2 font-medium border-2 border-tathir-dark-green hover:border-tathir-brown ${bloxat.className}`}
                          >
                            <FaPlay />
                            Watch Video
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchase(video.id)}
                            disabled={!canAfford || purchasing === video.id}
                            className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium border-2 ${bloxat.className} ${
                              canAfford
                                ? 'bg-tathir-maroon text-tathir-cream hover:bg-tathir-brown border-tathir-maroon hover:border-tathir-brown'
                                : 'bg-tathir-brown/30 text-tathir-brown/70 cursor-not-allowed border-tathir-brown/30'
                            }`}
                          >
                            {purchasing === video.id ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                Purchasing...
                              </>
                            ) : canAfford ? (
                              <>
                                <FaCoins />
                                Purchase for {video.price} coins
                              </>
                            ) : (
                              <>
                                <FaLock />
                                Insufficient coins
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        />
      </div>
    </div>
  );
}