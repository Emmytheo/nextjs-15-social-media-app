"use client";

import { OrganizationWithCounts } from "../page";
import { OrganizationSelectionsFeed } from "../OrganizationSelectionsFeed";
import { CreateOrganizationSelectionForm } from "../CreateOrganizationSelectionForm";
import { RestrictedContent } from "../RestrictedContent";
import { Music } from "lucide-react";

interface SelectionsTabProps {
  organization: OrganizationWithCounts;
  isAdmin?: boolean;
}

export function SelectionsTab({ organization, isAdmin }: SelectionsTabProps) {
  const isMember = organization.members.length > 0;

  if (!isMember && !isAdmin) {
    return <RestrictedContent />;
  }

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-md md:text-lg font-semibold">
          <Music className="h-5 w-5" />
          Song Selections
        </h3>
        {isAdmin && <CreateOrganizationSelectionForm organizationId={organization.id} />}
      </div>
      <div className="space-y-4 text-sm md:text-md">
        Curated song selections for {organization.name}&apos;s members to use in performances, practices, and events.
        <OrganizationSelectionsFeed organization={organization} />
      </div>
    </div>
  );
}
