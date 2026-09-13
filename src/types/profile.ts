export interface ProfileOrganization {
  id?: string;
  name?: string;
  slug?: string;
  email?: string;
  website?: string;
  description?: string;
}

export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  organization_id?: string | null;
  organization?: ProfileOrganization | null;
}

export interface UpdateProfilePayload {
  name: string;
}
