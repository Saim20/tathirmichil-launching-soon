"use client"
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, Edit, Star, Plus, Search, Filter, Eye, Loader2, Calendar, User } from "lucide-react";
import React from "react";
import { db } from "@/lib/firebase/firebase";
import { bloxat } from "@/components/fonts";

interface BlogPost {
    id: string;
    title: string;
    content: string;
    createdAt: { seconds: number; toDate: () => Date };
    updatedAt: { seconds: number; toDate: () => Date };
    dateCreatedAt?: { seconds: number };
    isFeatured?: boolean;
    imageUrl?: string;
    author?: string;
    viewCount?: number;
    [key: string]: any;
}

const AdminBlogsPage = () => {
    const [data, setData] = useState<BlogPost[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'regular'>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const router = useRouter();

    const editBlog = (id: string) => {
        router.push(`/admin/blogs/edit/${id}`);
    }

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        const unsubscribe = onSnapshot(
            collection(db, "blogs"), 
            (snapshot) => {
                try {
                    const fetchedData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as BlogPost[];
                    
                    const sorted = fetchedData.sort((a, b) => 
                        (b?.dateCreatedAt?.seconds || b?.createdAt?.seconds || 0) - 
                        (a?.dateCreatedAt?.seconds || a?.createdAt?.seconds || 0)
                    );
                    
                    setData(sorted);
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching blogs:", err);
                    setError("Failed to load blogs");
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Error in blogs listener:", err);
                setError("Failed to load blogs");
                setLoading(false);
            }
        );
        
        return () => unsubscribe();
    }, []);

    const deleteBlog = async (id: string) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.");
        if (!isConfirmed) return;
        
        setActionLoading(`delete-${id}`);
        try {
            await deleteDoc(doc(db, "blogs", id));
            // Success notification will be handled by the real-time listener
        } catch (error) {
            console.error("Error deleting blog:", error);
            alert("Failed to delete blog post. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };    
    
    const toggleFeatureBlog = async (id: string, currentStatus: boolean = false) => {
        setActionLoading(`feature-${id}`);
        try {
            await updateDoc(doc(db, "blogs", id), {
                isFeatured: !currentStatus,
                updatedAt: new Date()
            });
            // Success notification will be handled by the real-time listener
        } catch (error) {
            console.error("Error updating blog:", error);
            alert("Failed to update blog status. Please try again.");
        } finally {
            setActionLoading(null);
        }
    }

    const timeFormat = (timestamp: { seconds: number; toDate: () => Date } | undefined) => {
        if (!timestamp) return 'Unknown';
        
        try {
            const date = timestamp.toDate();
            const month = date.toLocaleString('default', { month: 'short' });
            const day = date.getDate();
            const year = date.getFullYear();
            return `${month} ${day}, ${year}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'Invalid Date';
        }
    };

    // Filter and search functionality
    const filteredData = data?.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            blog.content.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterFeatured === 'featured') return matchesSearch && blog.isFeatured;
        if (filterFeatured === 'regular') return matchesSearch && !blog.isFeatured;
        return matchesSearch;
    }) || [];

    const getContentPreview = (content: string, maxLength: number = 100) => {
        const stripped = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                                Blog Management
                            </h1>
                            <p className="text-sm sm:text-base text-tathir-brown">
                                Create, edit, and manage your blog posts
                            </p>
                        </div>
                        <Link href="/admin/create-blogs">
                            <button className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-tathir-dark-green text-tathir-beige rounded-lg hover:bg-tathir-maroon transition-colors duration-300 font-semibold shadow-lg">
                                <Plus className="text-sm" />
                                Create New Blog
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-6 bg-white/90 p-4 sm:p-6 rounded-xl shadow-lg border border-tathir-dark-green/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tathir-brown/60" />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-tathir-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tathir-dark-green/20 focus:border-tathir-dark-green bg-white"
                            />
                        </div>

                        {/* Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tathir-brown/60" />
                            <select
                                value={filterFeatured}
                                onChange={(e) => setFilterFeatured(e.target.value as 'all' | 'featured' | 'regular')}
                                className="w-full pl-10 pr-4 py-2 border border-tathir-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tathir-dark-green/20 focus:border-tathir-dark-green bg-white"
                            >
                                <option value="all">All Blogs</option>
                                <option value="featured">Featured Only</option>
                                <option value="regular">Regular Only</option>
                            </select>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-tathir-brown">
                            <span>Total: {data?.length || 0}</span>
                            <span>Showing: {filteredData.length}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="animate-spin text-4xl text-tathir-dark-green mx-auto mb-4" />
                            <p className="text-tathir-brown">Loading blogs...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 font-medium mb-2">Error loading blogs</p>
                        <p className="text-red-500 text-sm">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="bg-white/90 rounded-xl shadow-lg border border-tathir-dark-green/10 p-8 text-center">
                        <Eye className="text-4xl text-tathir-brown/40 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-tathir-dark-green mb-2">No blogs found</h3>
                        <p className="text-tathir-brown mb-4">
                            {searchTerm || filterFeatured !== 'all' 
                                ? "Try adjusting your search or filter criteria"
                                : "Get started by creating your first blog post"
                            }
                        </p>
                        <Link href="/admin/create-blogs">
                            <button className="px-6 py-2 bg-tathir-dark-green text-tathir-beige rounded-lg hover:bg-tathir-maroon transition-colors">
                                Create First Blog
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white/90 rounded-xl shadow-lg border border-tathir-dark-green/10 overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-tathir-dark-green text-tathir-beige">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Blog</th>
                                        <th className="px-6 py-4 text-left font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left font-semibold">Created</th>
                                        <th className="px-6 py-4 text-left font-semibold">Updated</th>
                                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((blog, index) => (
                                        <tr 
                                            key={blog.id} 
                                            className={`border-b border-tathir-brown/10 hover:bg-tathir-beige/30 transition-colors ${
                                                index % 2 === 0 ? 'bg-white/50' : 'bg-tathir-beige/10'
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    {blog.imageUrl && (
                                                        <img 
                                                            src={blog.imageUrl} 
                                                            alt={blog.title}
                                                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                                        />
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-tathir-dark-green truncate">
                                                            {blog.title}
                                                        </h3>
                                                        <p className="text-sm text-tathir-brown mt-1 line-clamp-2">
                                                            {getContentPreview(blog.content)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                    blog.isFeatured 
                                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                                                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                                                }`}>
                                                    <Star className={blog.isFeatured ? 'text-yellow-600' : 'text-gray-400'} />
                                                    {blog.isFeatured ? 'Featured' : 'Regular'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-tathir-brown">
                                                    <Calendar className="text-xs" />
                                                    {timeFormat(blog.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-tathir-brown">
                                                    <Calendar className="text-xs" />
                                                    {timeFormat(blog.updatedAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => editBlog(blog.id)}
                                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        title="Edit blog"
                                                    >
                                                        <Edit />
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleFeatureBlog(blog.id, blog.isFeatured)}
                                                        disabled={actionLoading === `feature-${blog.id}`}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            blog.isFeatured 
                                                                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                                                : 'bg-gray-600 text-white hover:bg-gray-700'
                                                        }`}
                                                        title={blog.isFeatured ? "Remove from featured" : "Mark as featured"}
                                                    >
                                                        {actionLoading === `feature-${blog.id}` ? (
                                                            <Loader2 className="animate-spin" />
                                                        ) : (
                                                            <Star />
                                                        )}
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteBlog(blog.id)}
                                                        disabled={actionLoading === `delete-${blog.id}`}
                                                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                        title="Delete blog"
                                                    >
                                                        {actionLoading === `delete-${blog.id}` ? (
                                                            <Loader2 className="animate-spin" />
                                                        ) : (
                                                            <Trash2 />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {filteredData.map((blog) => (
                                <div key={blog.id} className="bg-white rounded-lg shadow-md border border-tathir-brown/10 overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            {blog.imageUrl && (
                                                <img 
                                                    src={blog.imageUrl} 
                                                    alt={blog.title}
                                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-tathir-dark-green mb-1">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-sm text-tathir-brown line-clamp-2">
                                                    {getContentPreview(blog.content)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                blog.isFeatured 
                                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                                                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                                            }`}>
                                                <Star className={blog.isFeatured ? 'text-yellow-600' : 'text-gray-400'} />
                                                {blog.isFeatured ? 'Featured' : 'Regular'}
                                            </span>
                                        </div>

                                        <div className="text-xs text-tathir-brown space-y-1 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="text-xs" />
                                                Created: {timeFormat(blog.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="text-xs" />
                                                Updated: {timeFormat(blog.updatedAt)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => editBlog(blog.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                <Edit /> Edit
                                            </button>
                                            <button 
                                                onClick={() => toggleFeatureBlog(blog.id, blog.isFeatured)}
                                                disabled={actionLoading === `feature-${blog.id}`}
                                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                                                    blog.isFeatured 
                                                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                                        : 'bg-gray-600 text-white hover:bg-gray-700'
                                                }`}
                                            >
                                                {actionLoading === `feature-${blog.id}` ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <Star />
                                                )}
                                                {blog.isFeatured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button 
                                                onClick={() => deleteBlog(blog.id)}
                                                disabled={actionLoading === `delete-${blog.id}`}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                {actionLoading === `delete-${blog.id}` ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <Trash2 />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBlogsPage;