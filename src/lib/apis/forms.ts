import { db, storage } from '@/lib/firebase/firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PersonalBatchFormData } from '@/lib/models/form';
import { safeApiCall } from './base';
import { Timestamp } from 'firebase-admin/firestore';

// Submit form data to Firestore
export const submitPersonalBatchForm = async (formData: PersonalBatchFormData) => {
  return safeApiCall(async () => {
    // Use userId as the document ID
    const formRef = doc(db, 'forms', formData.userId);

    await setDoc(formRef, {
      ...formData,
      submittedAt: new Date(),
      status: 'pending'
    });

    return { success: true, formId: formData.userId };
  });
};

// Upload photo to Firebase Storage and update user profile
export const uploadFormPhoto = async (file: File, userId: string) => {
  return safeApiCall(async () => {
    const photoRef = ref(storage, `profile-pictures/${userId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(photoRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update user's profile picture URL in users collection
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      profilePictureUrl: downloadURL,
      updatedAt: new Date()
    });

    return { success: true, photoUrl: downloadURL };
  });
};

// Check if user has already submitted a form
export const checkExistingFormSubmission = async (userId: string) => {
  return safeApiCall(async () => {
    const formRef = doc(db, 'forms', userId);
    const userRef = doc(db, 'users', userId);
    const formDoc = await getDoc(formRef);
    const userDoc = await getDoc(userRef);

    const profilePictureUrl = userDoc.exists() ? (userDoc.data()?.profilePictureUrl as string) : '';

    if (formDoc.exists()) {
      return {
        success: true,
        hasSubmitted: true,
        formData: { ...formDoc.data(), profilePictureUrl, submittedAt: (formDoc.data().submittedAt as Timestamp).toDate() } as PersonalBatchFormData,
        formId: formDoc.id
      };
    }

    return { success: true, hasSubmitted: false };
  });
};

// Get form submission by ID
export const getFormSubmissionById = async (formId: string) => {
  return safeApiCall(async () => {
    const formRef = doc(db, 'forms', formId);
    const formDoc = await getDoc(formRef);

    if (!formDoc.exists()) {
      throw new Error('Form submission not found');
    }

    return { success: true, formData: formDoc.data() as PersonalBatchFormData };
  });
};

// Update existing form data
export const updatePersonalBatchForm = async (formData: PersonalBatchFormData) => {
  return safeApiCall(async () => {
    // Use userId as the document ID
    const formRef = doc(db, 'forms', formData.userId);
    

    // Exclude profilePictureUrl from formData before updating
    const { profilePictureUrl, ...formDataWithoutProfilePicture } = formData;
    await updateDoc(formRef, {
      ...formDataWithoutProfilePicture,
      updatedAt: new Date(),
      status: 'pending' // Reset status to pending when updated
    });

    return { success: true, formId: formData.userId };
  });
};
