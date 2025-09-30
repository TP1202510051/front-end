import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import type { UserProfileData } from "@/models/userProfileData";
import { toast } from "react-toastify";

export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  if (!uid) return null;
  const userDocRef = doc(db, "users", uid);
  const snap = await getDoc(userDocRef);
  return snap.exists() ? (snap.data() as UserProfileData) : null;
};


export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfileData>
) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, data, { merge: true }); // ✅ crea o actualiza
    return { success: true };
  } catch (error) {
    toast.error(
      `Error updating user profile: ${error instanceof Error ? error.message : String(error)}`
    );
    return { success: false, error };
  }
};

export const uploadFileAndUpdateProfile = async (
  uid: string,
  file: File,
  fieldName: "profilePictureUrl" | "company.logoUrl"
) => {
  if (!file) return { success: false, error: "No file provided" };

  // ✅ Ruta más clara: users/{uid}/{fieldName}/{filename}
  const filePath = `users/${uid}/${fieldName}/${file.name}`;
  const storageRef = ref(storage, filePath);

  try {
    // Subir archivo
    const snapshot = await uploadBytes(storageRef, file);

    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Actualizar Firestore con setDoc (merge)
    const userDocRef = doc(db, "users", uid);

    if (fieldName === "profilePictureUrl") {
      await setDoc(userDocRef, { profilePictureUrl: downloadURL }, { merge: true });
    } else if (fieldName === "company.logoUrl") {
      await setDoc(userDocRef, { company: { logoUrl: downloadURL } }, { merge: true });
    }

    return { success: true, url: downloadURL };
  } catch (error) {
    toast.error(
      `Error uploading file: ${error instanceof Error ? error.message : String(error)}`
    );
    return { success: false, error };
  }
};