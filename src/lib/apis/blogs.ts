import { collection, doc, getDoc, getDocs, limit, orderBy, Query, query, startAfter, DocumentData } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { ApiResponse, getPaginatedCollection, getDocumentById, transformers } from "./base";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface Blog {
    id?: string;
    imageUrl?: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
}

// ============================================================================
// DATA TRANSFORMERS
// ============================================================================

const transformBlog = (data: DocumentData, id: string): Blog => 
    transformers.withTimestamps<Blog>(data, id, {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        tags: data.tags || []
    });

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get public blogs with pagination and error handling
 */
export async function getPublicBlogs(
    prevBlogs: Blog[] = [], 
    limitToFetch: number = 3
): Promise<ApiResponse<Blog[]>> {
    return getPaginatedCollection('blogs', transformBlog, {
        limitToFetch,
        lastItem: prevBlogs.length > 0 ? prevBlogs[prevBlogs.length - 1].createdAt : null,
        orderByField: 'createdAt',
        orderDirection: 'desc'
    });
}

/**
 * Get blog by ID with error handling
 */
export async function getBlogById(id: string): Promise<ApiResponse<Blog>> {
    return getDocumentById('blogs', id, transformBlog);
}
