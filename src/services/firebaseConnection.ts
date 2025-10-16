import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDSaSA0-ZCwoxA-KzsoVM6hLFpVdTgC9nc",
  authDomain: "tarefasplus-59386.firebaseapp.com",
  projectId: "tarefasplus-59386",
  storageBucket: "tarefasplus-59386.firebasestorage.app",
  messagingSenderId: "168318140659",
  appId: "1:168318140659:web:5c463ea66e59a700bef786",
  measurementId: "G-9CJEYKQYPP"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp)

export { db };