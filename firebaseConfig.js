import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBP_ED_tr6cwXyNMgNihPi6wCnF8QGGPL4",
    authDomain: "adocao-57e51.firebaseapp.com",
    projectId: "adocao-57e51",
    storageBucket: "adocao-57e51.firebasestorage.app",
    messagingSenderId: "1052515783174",
    appId: "1:1052515783174:web:6d909b9f22f98f8d31e987",
    measurementId: "G-GJ9R4JM02Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };


