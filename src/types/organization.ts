export interface CreateOrganizationPayload {
  org_name: string;
  email: string;
  description: string;
  website: string;
}

export type OrganizationApplicationStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface OrganizationApplication {
  id: string;
  org_name: string;
  email: string;
  status: OrganizationApplicationStatus | string;
  description: string;
  website: string;
}

export type OrganizationApplicationRow = OrganizationApplication & {
  key: string;
};

export interface Organization {
  id: string;
  name: string;
  email: string;
  description: string;
  website: string;
  updated_at: string;
  created_at: string;
}

export type UpdateOrganizationPayload = Pick<
  Organization,
  "name" | "email" | "description" | "website"
>;

export type OrganizationRow = Organization & {
  key: string;
};
