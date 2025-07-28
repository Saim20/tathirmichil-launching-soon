"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft, FaLock, FaCoins, FaPlay } from "react-icons/fa";
import { AuthContext } from "@/lib/auth/auth-provider";

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

export default function VideoWatchPage() {
  const [video, setVideo] = useState<ClassVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const videoId = params.videoId as string;

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { user, userProfile, coinBalance } = authContext;

  useEffect(() => {
    if (user && videoId) {
      fetchVideoDetails();
    }
  }, [user, videoId]);

  useEffect(() => {
    if (userProfile && video) {
      const purchased = userProfile.purchasedVideos?.includes(video.id) || false;
      setIsPurchased(purchased);
      
      if (purchased) {
        generateSignedUrl();
      }
    }
  }, [userProfile, video]);

  const fetchVideoDetails = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/student/api/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const foundVideo = data.videos.find((v: ClassVideo) => v.id === videoId);
        if (foundVideo) {
          setVideo(foundVideo);
        } else {
          router.push('/student/classes');
        }
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSignedUrl = async () => {
    if (!video || !isPurchased) return;

    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/student/api/classes/watch/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSignedUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Error generating signed URL:', error);
    }
  };

  const handlePurchase = async () => {
    if (coinBalance < 100) {
      alert("You don't have enough coins to purchase this video!");
      return;
    }

    setPurchasing(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/student/api/classes/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId }),
      });

      if (response.ok) {
        setIsPurchased(true);
        alert("Video purchased successfully!");
        // The user profile will be updated via auth context
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Purchase failed. Please try again.");
      }
    } catch (error) {
      console.error('Error purchasing video:', error);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tathir-dark-green"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-tathir-dark-green mb-4">Video Not Found</h1>
            <button
              onClick={() => router.push('/student/classes')}
              className="bg-tathir-dark-green text-white px-6 py-3 rounded-lg hover:bg-tathir-dark-green transition-colors"
            >
              Back to Classes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/student/classes')}
              className="text-tathir-dark-green hover:text-tathir-green transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-tathir-dark-green font-minecraft">
              {video.title}
            </h1>
            <div className="flex items-center gap-2 text-tathir-brown">
              <FaCoins className="text-yellow-500" />
              <span className="font-medium">Your Balance: {coinBalance} coins</span>
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="aspect-video bg-black relative">
            {isPurchased && signedUrl ? (
              <iframe
                src={signedUrl}
                className="w-full h-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <FaPlay className="text-6xl text-white opacity-50" />
                  </div>
                )}
                
                {!isPurchased && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="text-center text-white">
                      <FaLock className="text-4xl mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Purchase Required</h3>
                      <p className="mb-4">This video costs 100 coins</p>
                      <button
                        onClick={handlePurchase}
                        disabled={purchasing || coinBalance < 100}
                        className="bg-tathir-dark-green text-white px-6 py-3 rounded-lg hover:bg-tathir-dark-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                      >
                        <FaCoins />
                        {purchasing ? 'Purchasing...' : 'Purchase for 100 coins'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Video Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-tathir-dark-green mb-4">Description</h2>
              <p className="text-gray-700 mb-6">
                {video.description || 'No description available.'}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-tathir-light-green bg-opacity-20 text-tathir-dark-green px-3 py-1 rounded-full text-sm">
                  {video.category}
                </span>
                {video.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-tathir-dark-green mb-2">Video Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="flex items-center gap-1">
                      <FaCoins className="text-yellow-500" />
                      {video.price} coins
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span>{video.totalViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchases:</span>
                    <span>{video.totalPurchases}</span>
                  </div>
                </div>
              </div>

              {isPurchased && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <FaPlay />
                    <span className="font-medium">Access Granted</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    You have purchased this video and can watch it anytime.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
