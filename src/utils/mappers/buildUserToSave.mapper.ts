import type { UserProfileData } from "@/models/userProfileData";

export function buildUpdatePayload(profile: UserProfileData): Partial<UserProfileData> {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    company: {
      name: profile.company?.name ?? "",
      ruc: profile.company?.ruc ?? "",
      address: profile.company?.address ?? "",
      phone: profile.company?.phone ?? "",
      logoUrl: profile.company?.logoUrl ?? "",
    },
  };
}
