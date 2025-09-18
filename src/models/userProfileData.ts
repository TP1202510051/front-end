export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  company: {
    name?: string;
    ruc?: string;
    address?: string;
    phone?: string;
    logoUrl?: string;
  };
  profilePictureUrl?: string;
}