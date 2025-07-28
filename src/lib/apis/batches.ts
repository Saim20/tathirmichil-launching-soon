import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { ApiResponse, safeApiCall, transformers } from "./base";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface SimpleBatch {
    id: string;
    name: string;
    createdAt: Date;
}

// ============================================================================
// DATA TRANSFORMERS
// ============================================================================

const transformBatch = (data: DocumentData, id: string): SimpleBatch => 
    transformers.withTimestamps<SimpleBatch>(data, id, {
        name: data.name
    });

// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================

/**
 * Get all batches with error handling
 */
export async function getBatches(): Promise<ApiResponse<SimpleBatch[]>> {
    return safeApiCall(async () => {
        const batchesCollection = collection(db, "batches");
        const snapshot = await getDocs(batchesCollection);
        return snapshot.docs.map(doc => transformBatch(doc.data(), doc.id));
    }, 'Failed to fetch batches');
}
