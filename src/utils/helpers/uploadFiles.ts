import { uploadFileAndUpdateProfile } from "@/services/user.service";

export async function uploadFiles(
  uid: string,
  uploads: { file: File | null; field: "profilePictureUrl" | "companyLogoUrl" }[]
) {
  for (const { file, field } of uploads) {
    if (file) {
      await uploadFileAndUpdateProfile(uid, file, field);
    }
  }
}
