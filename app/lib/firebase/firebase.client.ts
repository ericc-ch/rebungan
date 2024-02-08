import { initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIH3X0ivbwN7BpBSb2qiMYcP2ksikJ-vM",
  authDomain: "test-tabungan.firebaseapp.com",
  projectId: "test-tabungan",
  storageBucket: "test-tabungan.appspot.com",
  messagingSenderId: "462116814938",
  appId: "1:462116814938:web:8584569284e54a338b1863",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

auth.setPersistence(inMemoryPersistence);
