import { auth } from "../../firebase"; // Update the path if your firebase.ts is in 'src/firebase.ts'
import type { UserProfileData } from "@/models/userProfileData";

export function mergeProfile(
  dbProfile: UserProfileData | null,
  extraData: Partial<UserProfileData> | null,
  firebaseUser: typeof auth.currentUser
): UserProfileData {
  return {
    firstName: dbProfile?.firstName || extraData?.firstName || firebaseUser?.displayName?.split(" ")[0] || "",
    lastName: dbProfile?.lastName || extraData?.lastName || firebaseUser?.displayName?.split(" ")[1] || "",
    email: dbProfile?.email || extraData?.email || firebaseUser?.email || "",
    profilePictureUrl: dbProfile?.profilePictureUrl || firebaseUser?.photoURL || undefined,
    company: {
      name: dbProfile?.company?.name || extraData?.company?.name || "",
      ruc: dbProfile?.company?.ruc || extraData?.company?.ruc || "",
      address: dbProfile?.company?.address || extraData?.company?.address || "",
      phone: dbProfile?.company?.phone || extraData?.company?.phone || "",
      logoUrl: dbProfile?.company?.logoUrl || extraData?.company?.logoUrl || undefined,
    },
  };
}