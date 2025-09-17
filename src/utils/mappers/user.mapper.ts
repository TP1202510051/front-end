import type { User } from "firebase/auth";
import type { UserProfileData } from "@/models/userProfileData";


export const mapFirebaseUserToProfile = (user: User): UserProfileData => {
  return {
    firstName: user.displayName?.split(" ")[0] ?? "",
    lastName: user.displayName?.split(" ").slice(1).join(" ") ?? "",
    email: user.email ?? "",
    profilePictureUrl: user.photoURL ?? undefined,
    company: {
      name: "",
      ruc: "",
      address: "",
      phone: "",
    },
  };
};