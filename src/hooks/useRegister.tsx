import { useState } from "react";
import { register } from "@/services/auth.service";
import type { UserProfileData } from "@/models/userProfileData";

export function useRegister() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (userData: UserProfileData, password: string) => {
        setLoading(true);
        setError(null);
        const { user, error } = await register(userData, password);
        setLoading(false);
        if (error) {
      setError(error);
      return null;
    }
    return user;
  };

  return { handleRegister, loading, error };
}