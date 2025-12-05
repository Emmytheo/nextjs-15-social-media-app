import { Organization } from "@prisma/client";
import UserAvatar from "../../../../components/UserAvatar"
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";

interface OrganizationProfileProps {
  organization: {
    id: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function OrganizationProfile({ organization }: OrganizationProfileProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <UserAvatar
          avatarUrl={organization.logoUrl}
          className="h-24 w-24"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          {organization.description && (
            <p className="text-muted-foreground mt-2">{organization.description}</p>
          )}
          <div className="mt-4 flex gap-2">
            <Button variant="outline">Follow</Button>
            <Button>Join</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
