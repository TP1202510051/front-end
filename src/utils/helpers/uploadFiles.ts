import type { UserProfileData } from "@/models/userProfileData";
import { uploadFileAndUpdateProfile } from "@/services/user.service";

export async function uploadFiles(
  uid: string,
  uploads: { file: File | null; field: "profilePictureUrl" | "company.logoUrl" }[]
) {
  const results: Partial<UserProfileData> = {};
  for (const { file, field } of uploads) {
    if (file) {
      const res = await uploadFileAndUpdateProfile(uid, file, field);
      if (res.success && res.url) {
        if (field === "profilePictureUrl") {
          results.profilePictureUrl = res.url;
        } else if (field === "company.logoUrl") {
          results.company = { ...(results.company ?? {}), logoUrl: res.url };
        }
      }
    }
  }
  return results;
}