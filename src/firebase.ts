import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { runtimeConfig } from '@/runtime-config';

// La identidad de Firebase es de la instalacion, no del build: viene de runtime-config.json.
const app = initializeApp(runtimeConfig().firebase);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');
const storage = getStorage(app);
export const db = getFirestore(app);

export { storage, app };
