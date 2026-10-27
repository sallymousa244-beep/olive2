import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLmWe75Udr1F0V5XnNvcHY0Lr6RRSUH1k",
  authDomain: "olive-hope-grove.firebaseapp.com",
  projectId: "olive-hope-grove",
  storageBucket: "olive-hope-grove.firebasestorage.app",
  messagingSenderId: "256896417797",
  appId: "1:256896417797:web:ce1a4840a0baa560215c6c",
  measurementId: "G-Z3F1721X57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const authReady = signInAnonymously(auth);

export { db, auth, authReady };