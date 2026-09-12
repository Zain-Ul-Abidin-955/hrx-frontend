export interface ProfileOrganization {
  name?: string;
  email?: string;
  website?: string;
  description?: string;
}

export interface UserProfile {
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  organization?: ProfileOrganization | null;
}

export interface UpdateProfilePayload {
  name: string;
}
