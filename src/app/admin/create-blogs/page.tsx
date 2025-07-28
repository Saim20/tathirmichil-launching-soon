"use client"
import RichTextEditor from '@/components/admin/RichTextEditor';
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/firebase';
import { FaUpload, FaImage, FaSave, FaTimes, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import Link from 'next/link';
import Image from 'next/image';
import { uploadBlogImage, validateBlogImageFile } from '@/lib/utils/blogImageUpload';

const CreateBlogPage = () => {
    const [blogBody, setBlogBody] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const router = useRouter();
    const date = new Date();

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
            const url = await uploadBlogImage(selectedFile);
            setImageUrl(url);
        } catch (error) {
            console.error('Image upload failed', error);
            setErrors(prev => ({ 
                ...prev, 
                image: error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
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
        
        if (!blogBody.trim()) {
            newErrors.content = 'Content is required';
        } else if (blogBody.trim().length < 50) {
            newErrors.content = 'Content must be at least 50 characters long';
        }
        
        if (!imageUrl) {
            newErrors.image = 'Image is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBodyChange = (content: string) => {
        setBlogBody(content);
        if (errors.content && content.trim().length >= 50) {
            setErrors(prev => ({ ...prev, content: '' }));
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTitle(value);
        if (errors.title && value.trim().length >= 3) {
            setErrors(prev => ({ ...prev, title: '' }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const blogData = {
                imageUrl: imageUrl,
                title: title.trim(),
                content: blogBody.trim(),
                createdAt: date,
                updatedAt: date,
                isFeatured: false
            };

            const docRef = collection(db, 'blogs');
            await addDoc(docRef, blogData);

            resetForm();
            router.push('/admin/blogs');
        } catch (error) {
            console.error('Error adding blog post: ', error);
            setErrors(prev => ({ ...prev, submit: 'Failed to create blog post. Please try again.' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setImage(null);
        setImageUrl('');
        setTitle('');
        setBlogBody('');
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <Link 
                        href="/admin/blogs"
                        className="inline-flex items-center text-sm text-tathir-brown hover:text-tathir-dark-green mb-4 group transition-colors"
                    >
                        <FaArrowLeft className="mr-2 text-xs transition-transform group-hover:-translate-x-1" />
                        Back to Blogs
                    </Link>
                    
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                        Create New Blog Post
                    </h1>
                    <p className="text-sm sm:text-base text-tathir-brown">
                        Share your thoughts and insights with your audience
                    </p>
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
                                                    <FaSpinner className="animate-spin text-3xl text-tathir-dark-green mb-4" />
                                                    <p className="text-sm text-tathir-brown">Uploading image...</p>
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
                                                    <p className="text-sm text-tathir-dark-green font-medium">Image uploaded successfully!</p>
                                                    <p className="text-xs text-tathir-brown">Click to change image</p>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload className="text-3xl text-tathir-brown/60 mb-4" />
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
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>
                                {errors.image && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <FaTimes className="text-xs" />
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
                                onChange={handleTitleChange}
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
                                    <FaTimes className="text-xs" />
                                    {errors.title}
                                </p>
                            )}
                            <p className="text-xs text-tathir-brown/60 mt-1">
                                {title.length}/100 characters
                            </p>
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
                                    value={blogBody}
                                    onChange={handleBodyChange}
                                />
                            </div>
                            {errors.content && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FaTimes className="text-xs" />
                                    {errors.content}
                                </p>
                            )}
                            <p className="text-xs text-tathir-brown/60 mt-1">
                                {blogBody.replace(/<[^>]*>/g, '').length} characters
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-tathir-brown/10">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-tathir-dark-green text-tathir-beige rounded-lg hover:bg-tathir-maroon transition-colors duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Create Blog Post
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-tathir-maroon border border-tathir-maroon rounded-lg hover:bg-tathir-beige transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                            >
                                <FaTimes />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Writing Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Use a clear, descriptive title that captures your main topic</li>
                        <li>• Include an engaging introduction to hook your readers</li>
                        <li>• Use headings and bullet points to break up long text</li>
                        <li>• Add relevant images to make your content more engaging</li>
                        <li>• Proofread your content before publishing</li>
                    </ul>
                                </div>
            </div>
        </div>
    );
};

export default CreateBlogPage;