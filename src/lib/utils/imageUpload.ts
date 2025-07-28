import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/firebase';
import imageCompression from 'browser-image-compression';

export interface ImageUploadOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    initialQuality?: number;
}

const DEFAULT_OPTIONS: ImageUploadOptions = {
    maxSizeMB: 1, // 1MB max file size
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true,
    initialQuality: 0.5 // 50% quality
};

/**
 * Compress an image file
 */
export async function compressImage(
    file: File, 
    options: ImageUploadOptions = {}
): Promise<File> {
    const compressionOptions = { ...DEFAULT_OPTIONS, ...options };
    
    try {
        const compressedFile = await imageCompression(file, compressionOptions);
        return compressedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw new Error('Failed to compress image');
    }
}

/**
 * Upload an image to Firebase Storage with compression
 */
export async function uploadQuestionImage(
    file: File,
    questionId: string,
    compressionOptions?: ImageUploadOptions
): Promise<string> {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select a valid image file');
        }

        // Validate file size (5MB max before compression)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Image size must be less than 5MB');
        }

        // Compress the image
        const compressedFile = await compressImage(file, compressionOptions);

        // Create a unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `question-${questionId}-${timestamp}.${extension}`;
        
        // Create storage reference
        const storageRef = ref(storage, `questions/${filename}`);
        
        // Upload the compressed file
        const snapshot = await uploadBytes(storageRef, compressedFile);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error instanceof Error ? error : new Error('Failed to upload image');
    }
}

/**
 * Delete an image from Firebase Storage
 */
export async function deleteQuestionImage(imageUrl: string): Promise<void> {
    try {
        // Extract the path from the URL
        const url = new URL(imageUrl);
        const pathname = url.pathname;
        
        // Extract the file path from Firebase Storage URL
        const pathMatch = pathname.match(/\/o\/(.+)\?/);
        if (!pathMatch) {
            throw new Error('Invalid Firebase Storage URL');
        }
        
        const filePath = decodeURIComponent(pathMatch[1]);
        const storageRef = ref(storage, filePath);
        
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error instanceof Error ? error : new Error('Failed to delete image');
    }
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        
        img.src = url;
    });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
        return { isValid: false, error: 'Please select a valid image file' };
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        return { isValid: false, error: 'Image size must be less than 5MB' };
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
        return { isValid: false, error: 'Supported formats: JPEG, PNG, WebP' };
    }

    return { isValid: true };
}
