"use client"
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase/firebase';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Upload, ImageIcon, Save, X, Loader2, ArrowLeft, Edit } from 'lucide-react';
import { bloxat } from '@/components/fonts';
import { uploadBlogImage, validateBlogImageFile } from '@/lib/utils/blogImageUpload';

interface Blog {
    image?: string;
    title: string;
    content: string;
    imageUrl?: string;
    isFeatured?: boolean;
    createdAt?: any;
    updatedAt?: any;
    [key: string]: any;
}

export default function EditBlogPage() {
    const { id } = useParams();
    const router = useRouter();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [blogContent, setBlogContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch blog data
    useEffect(() => {
        const fetchBlogData = async () => {
            try {
                setLoading(true);
                if (!id || Array.isArray(id)) {
                    throw new Error('Invalid blog ID');
                }
                
                const docRef = doc(db, 'blogs', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const blogData = docSnap.data() as Blog;
                    setBlog(blogData);
                    setBlogContent(blogData.content || '');
                    setImageUrl(blogData.imageUrl || '');
                    setTitle(blogData.title || '');
                } else {
                    throw new Error('Blog post not found');
                }
            } catch (error) {
                console.error('Error fetching blog:', error);
                setErrors(prev => ({ ...prev, fetch: 'Failed to load blog post' }));
            } finally {
                setLoading(false);
            }
        };

        fetchBlogData();
    }, [id]);

    // Track changes
    useEffect(() => {
        if (!blog) return;
        
        const hasContentChanges = blog.content !== blogContent;
        const hasTitleChanges = blog.title !== title;
        const hasImageChanges = blog.imageUrl !== imageUrl;
        
        setHasChanges(hasContentChanges || hasTitleChanges || hasImageChanges);
    }, [blog, blogContent, title, imageUrl]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file using the utility function
        const validation = validateBlogImageFile(selectedFile);
        if (!validation.isValid) {
            setErrors(prev => ({ ...prev, image: validation.error || 'Invalid file' }));
            return;
        }

        setImage(selectedFile);
        setIsUploading(true);
        setErrors(prev => ({ ...prev, image: '' }));

        try {
            const blogId = Array.isArray(id) ? id[0] : id;
            const url = await uploadBlogImage(selectedFile, blogId);
            setImageUrl(url);
        } catch (error) {
            console.error('Image upload failed', error);
            setErrors(prev => ({ 
                ...prev, 
                image: error instanceof Error ? error.message : 'Failed to upload image'
            }));
        } finally {
            setIsUploading(false);
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters long';
        }
        
        if (!blogContent.trim()) {
            newErrors.content = 'Content is required';
        } else if (blogContent.trim().length < 50) {
            newErrors.content = 'Content must be at least 50 characters long';
        }
        
        if (!imageUrl) {
            newErrors.image = 'Image is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !blog) return;

        if (!id || Array.isArray(id)) {
            setErrors(prev => ({ ...prev, submit: 'Invalid blog ID' }));
            return;
        }

        setIsSubmitting(true);
        try {
            const blogData: Partial<Blog> & { updatedAt: Date } = {
                updatedAt: new Date(),
            };
            
            // Only update changed fields
            if (blog.imageUrl !== imageUrl) blogData.imageUrl = imageUrl;
            if (blog.title !== title.trim()) blogData.title = title.trim();
            if (blog.content !== blogContent) blogData.content = blogContent;

            const docRef = doc(db, 'blogs', id as string);
            await updateDoc(docRef, blogData);

            router.push('/admin/blogs');
        } catch (error) {
            console.error('Error updating blog post: ', error);
            setErrors(prev => ({ ...prev, submit: 'Failed to update blog post. Please try again.' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-4xl text-tathir-dark-green mx-auto mb-4" />
                    <h2 className={`text-xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                        Loading blog post...
                    </h2>
                </div>
            </div>
        );
    }

    if (errors.fetch) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className={`text-2xl font-bold text-tathir-maroon mb-4 ${bloxat.className}`}>
                        Error Loading Blog
                    </h2>
                    <p className="text-tathir-brown mb-6">{errors.fetch}</p>
                    <div className="space-x-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-tathir-dark-green text-white rounded-lg hover:brightness-110 transition-all"
                        >
                            Try Again
                        </button>
                        <Link href="/admin/blogs">
                            <button className="px-6 py-3 bg-white text-tathir-maroon border border-tathir-maroon rounded-lg hover:bg-tathir-beige transition-all">
                                Back to Blogs
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <Link 
                        href="/admin/blogs"
                        className="inline-flex items-center text-sm text-tathir-brown hover:text-tathir-dark-green mb-4 group transition-colors"
                    >
                        <ArrowLeft className="mr-2 text-xs transition-transform group-hover:-translate-x-1" />
                        Back to Blogs
                    </Link>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <Edit className="text-tathir-dark-green text-2xl" />
                        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-tathir-dark-green ${bloxat.className}`}>
                            Edit Blog Post
                        </h1>
                    </div>
                    
                    <p className="text-sm sm:text-base text-tathir-brown">
                        Update your blog post content and settings
                    </p>
                    
                    {hasChanges && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                            You have unsaved changes
                        </div>
                    )}
                </div>

                {/* Form */}
                <div className="bg-white/90 rounded-xl shadow-lg border border-tathir-dark-green/10 overflow-hidden">
                    <div className="p-6 sm:p-8 space-y-6">
                        
                        {/* General Error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-600 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        {/* Current Blog Info */}
                        {blog && (
                            <div className="bg-tathir-beige/30 rounded-lg p-4 border border-tathir-brown/20">
                                <h3 className="font-semibold text-tathir-dark-green mb-2">Current Blog Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-tathir-brown">Created:</span>
                                        <span className="ml-2 text-tathir-dark-green">
                                            {blog.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-tathir-brown">Last Updated:</span>
                                        <span className="ml-2 text-tathir-dark-green">
                                            {blog.updatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-tathir-brown">Status:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                            blog.isFeatured 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {blog.isFeatured ? 'Featured' : 'Regular'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-tathir-dark-green mb-3">
                                Blog Banner Image *
                            </label>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center w-full">
                                    <label 
                                        htmlFor="image-upload" 
                                        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                            errors.image 
                                                ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                                                : 'border-tathir-brown/30 bg-tathir-beige/20 hover:bg-tathir-beige/40'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="animate-spin text-3xl text-tathir-dark-green mb-4" />
                                                    <p className="text-sm text-tathir-brown">Uploading new image...</p>
                                                </>
                                            ) : imageUrl ? (
                                                <>
                                                    <Image 
                                                        src={imageUrl} 
                                                        alt="Blog banner" 
                                                        width={200}
                                                        height={120}
                                                        className="max-w-full max-h-32 object-cover rounded-lg mb-4"
                                                    />
                                                    <p className="text-sm text-tathir-dark-green font-medium">
                                                        {blog?.imageUrl !== imageUrl ? 'New image selected!' : 'Current blog image'}
                                                    </p>
                                                    <p className="text-xs text-tathir-brown">Click to change image</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="text-3xl text-tathir-brown/60 mb-4" />
                                                    <p className="mb-2 text-sm text-tathir-brown font-medium">
                                                        <span>Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-tathir-brown/60">PNG, JPG or WEBP (MAX. 5MB)</p>
                                                </>
                                            )}
                                        </div>
                                        <input 
                                            id="image-upload" 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden" 
                                            disabled={isUploading || isSubmitting}
                                        />
                                    </label>
                                </div>
                                {errors.image && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <X className="text-xs" />
                                        {errors.image}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-tathir-dark-green mb-3">
                                Blog Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (errors.title && e.target.value.trim().length >= 3) {
                                        setErrors(prev => ({ ...prev, title: '' }));
                                    }
                                }}
                                placeholder="Enter your blog title..."
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.title 
                                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                        : 'border-tathir-brown/20 focus:ring-tathir-dark-green/20 focus:border-tathir-dark-green'
                                } bg-white`}
                                disabled={isSubmitting}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <X className="text-xs" />
                                    {errors.title}
                                </p>
                            )}
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-tathir-brown/60">
                                    {title.length}/100 characters
                                </p>
                                {blog?.title !== title && (
                                    <span className="text-xs text-yellow-600 font-medium">Modified</span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-tathir-dark-green mb-3">
                                Blog Content *
                            </label>
                            <div className={`border rounded-lg overflow-hidden ${
                                errors.content 
                                    ? 'border-red-300' 
                                    : 'border-tathir-brown/20'
                            }`}>
                                <RichTextEditor
                                    value={blogContent}
                                    onChange={(content) => {
                                        setBlogContent(content);
                                        if (errors.content && content.trim().length >= 50) {
                                            setErrors(prev => ({ ...prev, content: '' }));
                                        }
                                    }}
                                />
                            </div>
                            {errors.content && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <X className="text-xs" />
                                    {errors.content}
                                </p>
                            )}
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-tathir-brown/60">
                                    {blogContent.replace(/<[^>]*>/g, '').length} characters
                                </p>
                                {blog?.content !== blogContent && (
                                    <span className="text-xs text-yellow-600 font-medium">Modified</span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-tathir-brown/10">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading || !hasChanges}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-tathir-dark-green text-tathir-beige rounded-lg hover:bg-tathir-maroon transition-colors duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save />
                                        {hasChanges ? 'Save Changes' : 'No Changes to Save'}
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-tathir-maroon border border-tathir-maroon rounded-lg hover:bg-tathir-beige transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                            >
                                <X />
                                {hasChanges ? 'Cancel' : 'Back'}
                            </button>
                        </div>

                        {hasChanges && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800 text-sm">
                                    <strong>Note:</strong> You have unsaved changes. Make sure to save before leaving this page.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}