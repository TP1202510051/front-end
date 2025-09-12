import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  type AuthError,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProfileData } from '@/models/userProfileData';
import { auth, googleProvider, githubProvider, db } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { AUTH_ERRORS } from '@/utils/constants/AUTH_ERRORS';
import { getUserProfile } from './user.service';
import { mapFirebaseUserToProfile } from '@/utils/mappers/user.mapper';
import { mapFirebaseError } from '@/utils/mappers/mapFirebaseError';

// --- Función de Login ---
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(result.user.uid);
    const profileMapped: UserProfileData = profile as UserProfileData ?? mapFirebaseUserToProfile(result.user);
    return profileMapped;
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

export const loginWithGoogle = async (): Promise<UserProfileData | string> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await getUserProfile(result.user.uid);
    return (profile as UserProfileData) ?? mapFirebaseUserToProfile(result.user);
  } catch (error: unknown) {
    let message = AUTH_ERRORS.default;
    if (error instanceof Error && error.message.includes("popup-closed-by-user")) {
      message = AUTH_ERRORS.popupClosed;
    } else if (error instanceof Error && error.message.includes("network-request-failed")) {
      message = AUTH_ERRORS.network;
    }

    // lanzamos el error en lugar de retornarlo
    throw new Error(message);
  }
};

export const loginWithGithub = async () => {
    try {
    const result = await signInWithPopup(auth, githubProvider);
    const profile = await getUserProfile(result.user.uid);
    return (profile as UserProfileData) ?? mapFirebaseUserToProfile(result.user);
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
// --- Función de Logout ---
export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
};

export async function register(userData: UserProfileData, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
    const user = userCredential.user;

    const profileData = {
      ...userData,
      uid: user.uid,
      profilePictureUrl: '',
      companyLogoUrl: '',
    };

    await setDoc(doc(db, 'users', user.uid), profileData);
    return { user, error: null };
  } catch (err: unknown) {
    const message = mapFirebaseError(err);
    return { user: null, error: message };
  }
}
