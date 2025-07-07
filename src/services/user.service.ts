// src/services/user.service.ts

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase"; // Importamos db y storage

// --- Obtener Perfil de Usuario ---
export const getUserProfile = async (uid: string) => {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// --- Actualizar Perfil de Usuario (solo datos de texto) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateUserProfile = async (uid: string, data: any) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, data);
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error };
  }
};

// --- Subir un archivo y actualizar la URL en el perfil ---
export const uploadFileAndUpdateProfile = async (uid: string, file: File, fieldName: 'profilePictureUrl' | 'companyLogoUrl') => {
    if (!file) return { success: false, error: 'No file provided' };
    
    // Crear una referencia única para el archivo
    const filePath = `${fieldName}/${uid}/${file.name}`;
    const storageRef = ref(storage, filePath);

    try {
        // 1. Subir el archivo a Firebase Storage
        const snapshot = await uploadBytes(storageRef, file);
        // 2. Obtener la URL de descarga del archivo
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // 3. Actualizar el documento del usuario con la nueva URL
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