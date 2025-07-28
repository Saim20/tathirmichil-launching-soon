"use client";

import { useState, useEffect, useContext } from "react";
import { FaUpload, FaVideo, FaEdit, FaTrash, FaEye, FaCoins } from "react-icons/fa";
import { AuthContext } from "@/lib/auth/auth-provider";
import { auth } from "@/lib/firebase/firebase";

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
}

export default function AdminClassesPage() {
  const [videos, setVideos] = useState<ClassVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { user } = authContext;

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      
      const response = await fetch('/admin/api/classes', {
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tathir-dark-green"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-tathir-dark-green font-minecraft">
                Class Recordings Management
              </h1>
              <p className="text-tathir-brown mt-2">
                Upload and manage class recordings for students to purchase with coins
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-tathir-dark-green text-white px-6 py-3 rounded-lg hover:bg-tathir-dark-green transition-colors flex items-center gap-2 font-medium"
            >
              <FaUpload />
              Upload New Video
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tathir-brown">Total Videos</p>
                <p className="text-2xl font-bold text-tathir-dark-green">{videos.length}</p>
              </div>
              <FaVideo className="text-3xl text-tathir-light-green" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tathir-brown">Active Videos</p>
                <p className="text-2xl font-bold text-tathir-dark-green">
                  {videos.filter(v => v.isActive).length}
                </p>
              </div>
              <FaEye className="text-3xl text-tathir-light-green" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tathir-brown">Fixed Price</p>
                <p className="text-2xl font-bold text-tathir-dark-green">100 coins</p>
              </div>
              <FaCoins className="text-3xl text-tathir-light-green" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tathir-brown">Categories</p>
                <p className="text-2xl font-bold text-tathir-dark-green">
                  {new Set(videos.map(v => v.category)).size}
                </p>
              </div>
              <FaVideo className="text-3xl text-tathir-light-green" />
            </div>
          </div>
        </div>

        {/* Videos List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-tathir-dark-green font-minecraft">
              Uploaded Videos
            </h2>
          </div>
          
          {videos.length === 0 ? (
            <div className="p-12 text-center">
              <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">No videos uploaded yet</h3>
              <p className="text-gray-400 mb-6">Start by uploading your first class recording</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-tathir-dark-green text-white px-6 py-3 rounded-lg hover:bg-tathir-dark-green transition-colors"
              >
                Upload First Video
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {videos.map((video) => (
                <div key={video.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Thumbnail */}
                    <div className="lg:w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      {video.thumbnailUrl ? (
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FaVideo className="text-4xl text-gray-400" />
                      )}
                    </div>
                    
                    {/* Video Info */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-tathir-dark-green mb-2">
                            {video.title}
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {video.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="bg-tathir-light-green bg-opacity-20 text-tathir-dark-green px-3 py-1 rounded-full text-sm">
                              {video.category}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                              <FaCoins className="text-xs" />
                              {video.price} coins
                            </span>
                            {video.duration && (
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              video.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {video.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {video.tags.map((tag) => (
                              <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
                            <FaEye />
                          </button>
                          <button className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors">
                            <FaEdit />
                          </button>
                          <button className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal 
            onClose={() => setShowUploadModal(false)}
            onUploadComplete={fetchVideos}
            user={user}
          />
        )}
      </div>
    </div>
  );
}

// Upload Modal Component
function UploadModal({ onClose, onUploadComplete, user }: { 
  onClose: () => void; 
  onUploadComplete: () => void; 
  user: any; // Firebase User type
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get direct upload URL from Cloudflare Stream
      const token = await user.getIdToken();
      
      const uploadTokenResponse = await fetch('/admin/api/classes/get-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (!uploadTokenResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL, videoId, cloudflareVideoId } = await uploadTokenResponse.json();

      // Step 2: Upload directly to Cloudflare Stream with progress tracking
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.response, { status: xhr.status }));
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('POST', uploadURL);
        xhr.send(uploadFormData);
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to Cloudflare Stream');
      }

      // Step 3: Save video metadata to our database
      const saveResponse = await fetch('/admin/api/classes/save-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId,
          cloudflareVideoId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          price: 100, // Fixed price
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save video metadata');
      }

      setUploadProgress(100);
      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-tathir-dark-green font-minecraft">
            Upload New Class Recording
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-tathir-brown mb-2">
              Video File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="video-upload"
                required
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <FaUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {file ? file.name : 'Click to select video file'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  MP4, MOV, AVI (max 2GB)
                </p>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-tathir-brown mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tathir-light-green"
              placeholder="Enter video title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-tathir-brown mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-tathir-light-green"
              placeholder="Enter video description"
            />
          </div>

          {/* Price Info and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tathir-brown mb-2">
                Price (Fixed)
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-600 flex items-center gap-2">
                <FaCoins className="text-yellow-500" />
                <span className="font-medium">100 coins</span>
                <span className="text-sm">(Fixed price for all videos)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-tathir-brown mb-2">
                Category *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tathir-light-green"
                placeholder="e.g., Mathematics, Physics"
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-tathir-brown mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tathir-light-green"
              placeholder="algebra, calculus, advanced"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-tathir-light-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-tathir-dark-green text-white py-2 px-4 rounded-lg hover:bg-tathir-dark-green transition-colors disabled:opacity-50"
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
