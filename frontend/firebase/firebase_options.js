// firebase-options.js

// Firebase CDN Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLXzvs4n-7u8rIDsjs7zoB-Afgq3kAsY4",
  authDomain: "energy-tracker-2728c.firebaseapp.com",
  projectId: "energy-tracker-2728c",
  storageBucket: "energy-tracker-2728c.firebasestorage.app",
  messagingSenderId: "995888760164",
  appId: "1:995888760164:web:2281d82ebeaab9ff2da671",
  measurementId: "G-BCYLY09MMS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Named exports for other modules
export {
  app,
  analytics,
  auth,
  db,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
};
