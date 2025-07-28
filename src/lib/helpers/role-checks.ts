import { adminAuth, adminFirestore } from '../firebase/firebase-admin';

export async function checkIfUserIsAdmin(idToken: string): Promise<{ isAdmin: boolean; userId: string; }> {
    // Check if the user is admin from firestore
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    if (!userId) {
        return { isAdmin: false, userId: '' };
    }
    // Fetch user data from Firestore
    const userRef = adminFirestore.collection('users').doc(userId);
    if (!userRef) {
        return { isAdmin: false, userId: '' };
    }
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) {
        return { isAdmin: false, userId: '' };
    }
    const userData = userSnapshot.data();
    if (!userData || !(userData.role === 'admin')) {
        return { isAdmin: false, userId: userId };
    }
    return { isAdmin: true, userId: userId };
}

export async function checkIfUserIsStudent(idToken: string): Promise<{ isStudent: boolean; userId: string; }> {
    // Check if the user is student from firestore
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    if (!userId) {
        return { isStudent: false, userId: '' };
    }
    // // Fetch user data from Firestore
    // const userRef = adminFirestore.collection('users').doc(userId);
    // if (!userRef) {
    //     return { isStudent: false, userId: '' };
    // }
    // const userSnapshot = await userRef.get();
    // if (!userSnapshot.exists) {
    //     return { isStudent: false, userId: '' };
    // }
    // const userData = userSnapshot.data();
    // if (!userData || !(userData.role === 'student')) {
    //     return { isStudent: false, userId: userId };
    // }
    return { isStudent: true, userId: userId };
}