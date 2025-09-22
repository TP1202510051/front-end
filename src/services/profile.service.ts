// services/userProfile.service.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { UserProfileData } from '@/models/userProfileData';

export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfileData;
};
