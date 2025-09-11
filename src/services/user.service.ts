import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import type { UserProfileData } from "@/models/userProfileData";

export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  if (!uid) return null;
  const userDocRef = doc(db, "users", uid);
  const snap = await getDoc(userDocRef);
  return snap.exists() ? (snap.data() as UserProfileData) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfileData>) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, data);
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error };
  }
};

export const uploadFileAndUpdateProfile = async (uid: string, file: File, fieldName: 'profilePictureUrl' | 'companyLogoUrl') => {
    if (!file) return { success: false, error: 'No file provided' };
    const filePath = `${fieldName}/${uid}/${file.name}`;
    const storageRef = ref(storage, filePath);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, {
            [fieldName]: downloadURL
        });

        return { success: true, url: downloadURL };
    } catch (error) {
        console.error("Error uploading file:", error);
        return { success: false, error };
    }
};