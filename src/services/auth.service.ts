import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProfileData } from '@/models/userProfileData';
import { auth, googleProvider, githubProvider, db } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { AUTH_ERRORS } from '@/utils/constants/AUTH_ERRORS';
import { getUserProfile } from './user.service';
import { mapFirebaseUserToProfile } from '@/utils/mappers/user.mapper';
import { mapFirebaseError } from '@/utils/mappers/mapFirebaseError';
import type { AuthResult } from '@/models/authResult';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

// --- Función de Login ---
export const loginWithEmail = async (email: string, password: string): Promise<AuthResult | string> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    const profile = await getUserProfile(result.user.uid);
    const profileMapped: UserProfileData = profile ?? mapFirebaseUserToProfile(result.user);
    return { user: profileMapped, idToken, error: null };
  } catch (error: unknown) {
    let message = AUTH_ERRORS.default;
    if (error instanceof Error && error.message.includes('popup-closed')) {
      message = AUTH_ERRORS.popupClosed;
    } else if (error instanceof Error && error.message.includes('network-request-failed')) {
      message = AUTH_ERRORS.network;
    }
    return message;
  }
};

export const loginWithGoogle = async (): Promise<AuthResult | string> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const profile = await getUserProfile(result.user.uid);
    const profileMapped = profile ?? mapFirebaseUserToProfile(result.user);
    return { user: profileMapped, idToken, error: null };
  } catch (error: unknown) {
    let message = AUTH_ERRORS.default;
    if (error instanceof Error && error.message.includes("popup-closed-by-user")) {
      message = AUTH_ERRORS.popupClosed;
    } else if (error instanceof Error && error.message.includes("network-request-failed")) {
      message = AUTH_ERRORS.network;
    }

    throw new Error(message);
  }
};

export const loginWithGithub = async (): Promise<AuthResult | string> => {
    try {
    const result = await signInWithPopup(auth, githubProvider);
    const profile = await getUserProfile(result.user.uid);
    const idToken = await result.user.getIdToken();
    return { user: profile ?? mapFirebaseUserToProfile(result.user), idToken, error: null };
  } catch (error: unknown) {
    let message = AUTH_ERRORS.default;
    if (error instanceof Error && error.message.includes('popup-closed')) {
      message = AUTH_ERRORS.popupClosed;
    } else if (error instanceof Error && error.message.includes('network-request-failed')) {
      message = AUTH_ERRORS.network;
    }
    throw new Error(message);
  }
};

export const logout = async (): Promise<{ error: string | null }> => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: mapFirebaseError(error) };
  }
};

export async function register(userData: UserProfileData, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
    const user = userCredential.user;

    const profileData = {
      ...userData,
      uid: user.uid,
      companyLogoUrl: '',
    };

    await setDoc(doc(db, 'users', user.uid), profileData);
    return { user, error: null };
  } catch (err: unknown) {
    const message = mapFirebaseError(err);
    return { user: null, error: message };
  }
}

export const sendRecoveryEmail = async (email: string) => {
  const auth = getAuth();
  try {
    const response = await sendPasswordResetEmail(auth, email);
    console.log(response);
    toast.success("Se envió un enlace de recuperación a tu correo.");
  } catch (error) {
    if (error instanceof Error) {
      toast.error(`Error: ${error.message}`);
    }
  }
};
