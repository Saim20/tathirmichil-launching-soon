// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGqsDajivlFz5P7gwpj7LFLiQugGliJKM",
  authDomain: "tathirmichil.firebaseapp.com",
  databaseURL: "https://tathirmichil-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tathirmichil",
  storageBucket: "tathirmichil.firebasestorage.app",
  messagingSenderId: "433090504131",
  appId: "1:433090504131:web:bafc55dd7f8f007a670976",
  measurementId: "G-LYZ01LZ0JW"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);