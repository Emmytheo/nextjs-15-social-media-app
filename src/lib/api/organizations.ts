import { Organization } from "@prisma/client";
import ky from "@/lib/ky";

export interface CreateOrganizationInput {
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
}

export interface EditOrganizationInput extends CreateOrganizationInput {
  id: string;
}

export async function createOrganization(data: CreateOrganizationInput): Promise<Organization> {
  return ky.post("api/organizations", { json: data }).json();
}

export async function editOrganization(data: EditOrganizationInput): Promise<Organization> {
  return ky.patch("api/organizations", { json: data }).json();
}
