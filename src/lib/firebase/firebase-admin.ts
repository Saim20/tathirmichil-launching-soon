import admin, { ServiceAccount } from 'firebase-admin';

const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDMz+fiRHc85rJX\n151G4eEgyWNqeMT2yUztOPLkSlvd0DVk2EKA8v2huf6kSbNfU5WnQSPi+GJnWIN6\nu2Y3NBqym+XYHTZEyRRFCUlFI/CDumLXp0+GlRBUkBF+SE63/IK/QyV7rUmwcp5t\ntFKiQzAdRgZs1b/FEEsQ8zK+rbYQB7HcOp8L2q/DTThsTfrhE4r/iYft4wjoeQ+u\n/6OfSJYFm1XO0+Bh50sy6krSb5xLmVLZex080we5fumdXPXMVD3vea3rTwDrkCFv\niIgBm+9Yw7JB0+3Eb/tXkZorT0oWPLkpz2+9tD8JhK8pK0M0rlA6GxZK8DkE+Jt9\nysgkhAo/AgMBAAECggEANn0DcH+Nh27KuLL8vTxf1ASwBcX+hLd2V1BE0nZz7VW0\nttEQFFVRI+MjO1r+NRi8IkSiwwIYz+zNAex0W7Bpf+YY5n+TDga+9UTssM/Ib4s5\nO61f62qh7xVrCgE7rBgqQq8e/EHUbnR38LC+ITwlw0v7bp4JSGi2x9ojwHXfj3C6\nntnnY54zhj86p7jWp2rwAS8OikejA5O9NP0c/2/yzSEvabXCEIx0i1Nqx7LA7gJH\n+1+yy0/6z4VG1oHU2b+Z0fSy+ErM6jmInyJ/QdeRyUpt1xaswIx/OFyle8lKKd1a\n7vUg8SP0Lw9FpOzx2Gb+iecOuSmMVtZ/abq1+DPViQKBgQDxeXVG8+4xfOEih5Yn\nQpXoOEbbv3WY4n3PaCRzIRvywOKBeL4jspuutsi07oVf0y2VBZ1ECikMe2i5PyzQ\nj71Q91MwyxGq4i6RC9i2vrNa+hPm8YD4YmW6opzF5YYbW8HqqnqZRrlWGeUjayAm\nePnBAQZvauS/wz6c1czAAMOiZwKBgQDZId9/b3XtsCYFa5BgRoaDPtmbeZBEmJ7+\n3pFV8LjeXXhIoc0PoU1uORNv606mNDO2ZzoLwA/EcHvU+Kti/aroZRS3apTXg/t4\nX5asxvl4WZpzc8o00PTt9vMdE+PcmTsBh6IwCFU5x1lpOG/eQrjp62DjzhseN+nf\nDkUk/C1iaQKBgQCMp3DWmXOfQ9xnno6p47EqCM3NZmJ7YUJjM4g3v4tmBVBqlgg7\nBuiEBlg2e9EYlguxCAoo/boXWTMQ5GmYOoHNzaKZg0+ROBpjxoC/Qal7TruVBAtZ\nowcahWnII//Po8z6gb7T1UxTiNXdoaKihkkEUTKMZ7lCsdmgxTB0jn1l9QKBgEab\nJDEtTnzHHeX/T0hvRohhJKPRCN+1fWZFe58lkwgD/vwnWSYu/p3MA40OSFn1eadj\ns9VkU/w905aychDTigLd87mc99+I9Hn1I2r1nOPMx1OpoGRCWpMTDYU0FZGDZlOe\nBlh2LTiHoYR8rKvqqHSwbKZHPDw8VFmLK2LWee+ZAoGBAMOqEltUWXsfdvgyZc6l\nybeWclSyOaSr6xPjUHdT4elOiWNn62RdZu1RGMrx7Jlka/Jd3boMBXIEFBumu3Pw\nlaO6dQqUwj0/L4g6Zc2YYWuvBP5jSSM5+98OGQqtvOgUn+qyOPEn0r4MxKEuH1aA\nH2bmBshCFF+lyJMMbaDqWhct\n-----END PRIVATE KEY-----\n",
};

const databaseURL = "https://tathirmichil-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function getFirebaseAdmin() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL,
        });
    }

    return admin;
}

const firebaseAdmin = await getFirebaseAdmin();

const adminAuth = firebaseAdmin.auth();
const adminFirestore = firebaseAdmin.firestore();
const adminDb = firebaseAdmin.database();

export async function verifyIdToken(token: string) {
    return adminAuth.verifyIdToken(token);
  }


export { firebaseAdmin, adminAuth, adminFirestore, adminDb };