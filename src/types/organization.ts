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

export type Organization = OrganizationApplication;

export type OrganizationApplicationRow = OrganizationApplication & {
  key: string;
};
