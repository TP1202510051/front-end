// src/services/firebase.service.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const uploadImageToFirebase = async (file: File): Promise<string> => {
  const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};