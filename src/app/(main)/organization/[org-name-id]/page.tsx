import { validateRequest } from "@/auth";
import Link from "next/link";
import { Tabs, TabsContent, ScrollableTabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { OrganizationProfile } from "./OrganizationProfile";
import EditOrganizationButton from "./EditOrganizationButton";
import { OrganizationFeed } from "./OrganizationFeed";
import { OrganizationSidebar } from "@/components/OrganizationSidebar";
import { MembersTab } from "./tabs/MembersTab";
import { SelectionsTab } from "./tabs/SelectionsTab";
import { HighlightsTab } from "./tabs/HighlightsTab";
import { ActivitiesTab } from "./tabs/ActivitiesTab";
import { OrganizationEventsTab } from "./tabs/OrganizationEventsTab";
import { GalleryTab } from "./tabs/GalleryTab";
import Image from "next/image";
import { ProgramsTab } from "./tabs/ProgramsTab";
import { EventWithDetails } from "../../events/[event-id]/page";
import { Building2, Calendar, Users, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { OrganizationFab } from "./OrganizationFab";
import InvitationBanner from "./InvitationBanner";
import { getPendingInvitation } from "./member-actions";

interface PageProps {
  params: Promise<{ "org-name-id": string }> | { "org-name-id": string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export type { OrganizationProfileProps } from "./OrganizationProfile";

export interface OrganizationWithCounts {
  [x: string]: any;
  id: string;
  name: string;
  nameId: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  events?: EventWithDetails[];
  _count: {
    members: number;
    posts: number;
  };
  members: Array<{
    userId: string;
    role?: string;
  }>;
  admins: Array<{
    userId: string;
  }>;
}

const getOrganization = cache(
  async (orgNameOrId: string, loggedInUserId: string) => {
    const organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: { equals: orgNameOrId, mode: "insensitive" } },
          { id: orgNameOrId },
        ],
      },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            startDate: true,
            endDate: true,
            location: true,
            venue: true,
            address: true,
            coverPhotoUrl: true,
            logoUrl: true,
            ticketType: true,
            ticketPrice: true,
            ticketUrl: true,
            programmeOverview: true,
            status: true,
            organizationId: true,
          },
        },
        _count: {
          select: {
            members: true,
            admins: true,
            posts: true,
          },
        },
        members: {
          where: {
            userId: loggedInUserId,
          },
          select: {
            userId: true,
          },
        },
        admins: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!organization) notFound();

    return organization as unknown as OrganizationWithCounts;
  },
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();
  const resolvedParams = await params;
  const orgNameOrId = resolvedParams["org-name-id"];

  const organization = await getOrganization(orgNameOrId, loggedInUser?.id || "");

  return {
    title: `${organization.name} - Organization Hub`,
    description: organization.description || `Explore ${organization.name} community hub`,
  };
}

export default async function Page({
  params,
  searchParams,
}: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  const resolvedParams = await params;
  const orgNameOrId = resolvedParams["org-name-id"];
  const resolvedSearchParams = await searchParams;

  const organization = await getOrganization(orgNameOrId, loggedInUser?.id ?? "");

  const isAdmin = loggedInUser
    ? organization.admins.some((a) => a.userId === loggedInUser.id)
    : false;

  const pendingInvitation = loggedInUser
    ? await getPendingInvitation(organization.id)
    : null;

  const tabParam = resolvedSearchParams.tab;
  const currentTab = (Array.isArray(tabParam) ? tabParam[0] : tabParam) || "posts";

  return (
    <main className="flex w-full min-w-0 gap-5 flex-col">
      {pendingInvitation && <InvitationBanner notificationId={pendingInvitation.id} />}
      <div className="flex w-full min-w-0 gap-5">
        <div className="w-full min-w-0 space-y-5">
          <OrganizationProfile
            organization={organization}
            loggedInUserId={loggedInUser?.id}
          />

          <Tabs defaultValue={currentTab}>
            <ScrollableTabsList
              containerClassName="sticky top-[70px] z-10 rounded-2xl shadow-sm"
              className="w-full !justify-start bg-card/95 backdrop-blur-md border border-border/70 p-1.5 rounded-2xl h-auto"
            >
              <TabsTrigger value="posts" asChild className="rounded-xl px-4 py-2 font-bold text-xs sm:text-sm">
                <Link href={`?tab=posts`} replace scroll={false}>Posts</Link>
              </TabsTrigger>
              <TabsTrigger value="members" asChild className="rounded-xl px-4 py-2 font-bold text-xs sm:text-sm">
                <Link href={`?tab=members`} replace scroll={false}>Members</Link>
              </TabsTrigger>
              <TabsTrigger value="selections" asChild className="rounded-xl px-4 py-2 font-bold text-xs sm:text-sm">
                <Link href={`?tab=selections`} replace scroll={false}>Selections</Link>
              </TabsTrigger>
              <TabsTrigger value="highlights" asChild className="rounded-xl px-4 py-2 font-bold text-xs sm:text-sm">
                <Link href={`?tab=highlights`} replace scroll={false}>Highlights</Link>
              </TabsTrigger>
              <TabsTrigger value="activities" asChild className="rounded-xl px-4 py-2 font-bold text-xs sm:text-sm">
                <Link href={`?tab=activities`} replace scroll={false}>Activities</Link>
              </TabsTrigger>
              <TabsTrigger value="programs" asChild className="rounded-xl px-4 py-2 font-bold text-xs sm:text-sm">
                <Link href={`?tab=programs`} replace scroll={false}>Programs</Link>
              </TabsTrigger>
              <TabsTrigger value="events" asChild className="rounded-xl px-4 py-2 font-bold text-xs sm:text-sm">
                <Link href={`?tab=events`} replace scroll={false}>Events</Link>
              </TabsTrigger>
              <TabsTrigger value="gallery" asChild className="rounded-xl px-4 py-2 font-bold text-xs sm:text-sm">
                <Link href={`?tab=gallery`} replace scroll={false}>Gallery</Link>
              </TabsTrigger>
            </ScrollableTabsList>

            <TabsContent value="posts">
              <OrganizationFeed organization={organization} isAdmin={isAdmin} />
            </TabsContent>
            <TabsContent value="members">
              <MembersTab organization={organization} loggedInUser={loggedInUser} isAdmin={isAdmin} />
            </TabsContent>
            <TabsContent value="selections">
              <SelectionsTab organization={organization} isAdmin={isAdmin} />
            </TabsContent>
            <TabsContent value="highlights">
              <HighlightsTab organization={organization} isAdmin={isAdmin} />
            </TabsContent>
            <TabsContent value="programs">
              <ProgramsTab organization={organization} isAdmin={isAdmin} />
            </TabsContent>
            <TabsContent value="activities">
              <ActivitiesTab organization={organization} isAdmin={isAdmin} />
            </TabsContent>
            <TabsContent value="events">
              <OrganizationEventsTab organization={organization} isAdmin={isAdmin} />
            </TabsContent>
            <TabsContent value="gallery">
              <GalleryTab organization={organization} isAdmin={isAdmin} />
            </TabsContent>
          </Tabs>
        </div>
        <OrganizationSidebar organization={organization} />
      </div>
      {isAdmin && (
        <OrganizationFab organization={organization} isAdmin={isAdmin} />
      )}
    </main>
  );
}
