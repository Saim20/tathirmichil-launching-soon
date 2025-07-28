import { collection, query, where, orderBy, getDocs, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ApiResponse, safeApiCall, timestampToDate } from './base';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface SessionApplication {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  details: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  createdAt: Date;
  isDone: boolean;
}

export interface CreateSessionData {
  name: string;
  email: string;
  phoneNumber: string;
  details?: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
}

// ============================================================================
// DATA TRANSFORMERS
// ============================================================================

export const transformSession = (data: any, id: string): SessionApplication => {
  return {
    id,
    name: data.name || '',
    email: data.email || '',
    phoneNumber: data.phoneNumber || '',
    details: data.details || '',
    userId: data.userId || '',
    userDisplayName: data.userDisplayName || '',
    userEmail: data.userEmail || '',
    createdAt: data.createdAt ? timestampToDate(data.createdAt) : new Date(),
    isDone: data.isDone || false,
  };
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const createSession = async (sessionData: CreateSessionData): Promise<ApiResponse<{ sessionId: string }>> => {
  return safeApiCall(async () => {
    const sessionDoc = {
      ...sessionData,
      createdAt: Timestamp.now(),
      isDone: false
    };

    const docRef = await addDoc(collection(db, 'sessions'), sessionDoc);
    
    return { sessionId: docRef.id };
  });
};

export const getAllSessions = async (): Promise<ApiResponse<SessionApplication[]>> => {
  return safeApiCall(async () => {
    const q = query(
      collection(db, 'sessions'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => transformSession(doc.data(), doc.id));
    
    return sessions;
  });
};

export const getSessionsByUser = async (userId: string): Promise<ApiResponse<SessionApplication[]>> => {
  return safeApiCall(async () => {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => transformSession(doc.data(), doc.id));
    
    return sessions;
  });
};

export const getPendingSessions = async (): Promise<ApiResponse<SessionApplication[]>> => {
  return safeApiCall(async () => {
    const q = query(
      collection(db, 'sessions'),
      where('isDone', '==', false),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => transformSession(doc.data(), doc.id));
    
    return sessions;
  });
};

export const markSessionAsDone = async (sessionId: string): Promise<ApiResponse<void>> => {
  return safeApiCall(async () => {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      isDone: true
    });
  });
};

export const updateSessionStatus = async (sessionId: string, isDone: boolean): Promise<ApiResponse<void>> => {
  return safeApiCall(async () => {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      isDone
    });
  });
}; 