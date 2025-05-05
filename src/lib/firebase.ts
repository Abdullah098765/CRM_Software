import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD5XAX2_AO4CvthteROT6osg9Kp_foYQoQ",
  authDomain: "crm-software-7f1a0.firebaseapp.com",
  projectId: "crm-software-7f1a0",
  storageBucket: "crm-software-7f1a0.firebasestorage.app",
  messagingSenderId: "771581526151",
  appId: "1:771581526151:web:c9cfeba6651bedb000b822",
  measurementId: "G-GRVM45S3JK"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider }; 