// src/hooks/useProfileData.ts
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import type { UserProfileData } from "@/models/userProfileData";
import { getUserProfile } from "@/services/user.service";
import { mergeProfile } from "@/utils/mappers/profile.mapper";

export function useProfileData() {
  const currentUser = auth.currentUser;
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const extraData = stored ? JSON.parse(stored) : null;

    if (currentUser) {
      getUserProfile(currentUser.uid)
        .then((data) => {
          const merged = mergeProfile(data, extraData, currentUser);
          setProfile(merged);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  return { profile, loading };
}
