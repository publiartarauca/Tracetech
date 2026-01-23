// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmRdYQ9xTwo2BEwAWa0Q8wfB-AF-sUcUk",
  authDomain: "tracetech-17399.firebaseapp.com",
  projectId: "tracetech-17399",
  storageBucket: "tracetech-17399.firebasestorage.app",
  messagingSenderId: "305009152652",
  appId: "1:305009152652:web:1456eac16794f42e4761a9",
  measurementId: "G-GGSCS78E16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);