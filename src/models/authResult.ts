import type { UserProfileData } from './userProfileData';

export type AuthResult = {
  user: UserProfileData | null;
  idToken: string | null;
  error: string | null;
};
