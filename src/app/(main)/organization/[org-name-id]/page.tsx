import { validateRequest } from "@/auth";
import Link from "next/link";
import Linkify from "@/components/Linkify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
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
import { EventsTab } from "./tabs/EventsTab";
import { EventWithDetails } from "../../events/[event-id]/page";
import { Building2, Calendar, Users, FileText, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { OrganizationFab } from "./OrganizationFab";
import InvitationBanner from "./InvitationBanner";
import { getPendingInvitation } from "./member-actions";

interface PageProps {
  params: { "org-name-id": string };
}

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
    role: string;
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
            title: true,
            description: true,
            category: true,
            startDate: true,
            endDate: true,
            location: true,
            venue: true,
            address: true,
            ticketType: true,
            ticketPrice: true,
            ticketUrl: true,
            programmeOverview: true,
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
            // role: true,
          },
        },
        admins: {
          // where: {
          //   // userId: loggedInUserId,
          // },
          select: {
            userId: true,
            // role: true,
          },
        },
      },
    });

    if (!organization) notFound();

    return organization as unknown as OrganizationWithCounts;
  },
);

export async function generateMetadata({
  params: { "org-name-id": orgNameOrId },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const organization = await getOrganization(orgNameOrId, loggedInUser.id);

  return {
    title: `${organization.name}`,
  };
}

export default async function Page({
  params: { "org-name-id": orgNameOrId },
  searchParams,
}: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  // Allow public access, but loggedInUser will be null if not signed in

  const organization = await getOrganization(orgNameOrId, loggedInUser?.id ?? "");

  const isAdmin = loggedInUser ? organization.admins.some(a => a.userId === loggedInUser.id) : false;


  const pendingInvitation = loggedInUser ? await getPendingInvitation(organization.id) : null;

  const currentTab = searchParams.tab || "posts";

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
            <TabsList
              className="w-full !justify-start overflow-x-auto sticky top-[70px] shadow-md z-10"
              style={{ scrollbarWidth: "none" }}
            >
              <TabsTrigger value="posts" asChild>
                <Link href={`?tab=posts`} replace scroll={false}>Posts</Link>
              </TabsTrigger>
              <TabsTrigger value="members" asChild>
                <Link href={`?tab=members`} replace scroll={false}>Members</Link>
              </TabsTrigger>
              <TabsTrigger value="selections" asChild>
                <Link href={`?tab=selections`} replace scroll={false}>Selections</Link>
              </TabsTrigger>
              <TabsTrigger value="highlights" asChild>
                <Link href={`?tab=highlights`} replace scroll={false}>Highlights</Link>
              </TabsTrigger>
              <TabsTrigger value="activities" asChild>
                <Link href={`?tab=activities`} replace scroll={false}>Activities</Link>
              </TabsTrigger>
              <TabsTrigger value="programs" asChild>
                <Link href={`?tab=programs`} replace scroll={false}>Programs</Link>
              </TabsTrigger>
              <TabsTrigger value="events" asChild>
                <Link href={`?tab=events`} replace scroll={false}>Events</Link>
              </TabsTrigger>
              <TabsTrigger value="gallery" asChild>
                <Link href={`?tab=gallery`} replace scroll={false}>Gallery</Link>
              </TabsTrigger>
            </TabsList>

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
    </main>
  );
}

export interface OrganizationProfileProps {
  organization: OrganizationWithCounts;
  loggedInUserId: string | undefined;
}

function OrganizationProfile({
  organization,
  loggedInUserId,
}: OrganizationProfileProps) {
  const isMember = organization.members.length > 0;
  const isAdmin = organization.admins.some(a => a.userId === loggedInUserId);

  return (
    <div className="flex w-full flex-col">
      <div className="relative h-32 md:h-36 w-full flex-shrink-0 overflow-hidden rounded-t-2xl bg-muted">
        {organization.logoUrl ? (
          // Using logo as cover for now if no cover photo exists
          // In a real app, we'd want a separate cover photo field
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-3xl">
            <Image
              src={organization.logoUrl}
              alt={`${organization.name} cover`}
              fill
              className="object-cover opacity-50 blur-xl scale-110"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-primary/40" />
          </div>
        )}
      </div>

      <div className="relative flex w-full flex-col gap-5 rounded-b-2xl bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 md:gap-6">
          <div className="relative -mt-16 md:-mt-20 flex-shrink-0">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-card bg-muted overflow-hidden shadow-sm relative">
              {!organization.logoUrl ? (
                <Image
                  src={organization.logoUrl || "/img/icon.png"}
                  alt={`${organization.name} logo`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                  <span className="text-2xl font-bold">{organization.name.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2 pt-2">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-2xl font-bold tracking-tight">{organization.name}</h1>
                <div className="text-md text-muted-foreground font-medium">
                  @{organization.id}
                </div>
              </div>

              <div className="hidden md:block">
                {isAdmin && <EditOrganizationButton organization={organization} />}
              </div>
            </div>


          </div>
        </div>
        <div className="flex flex-wrap md:justify-center gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Created {formatDate(organization.createdAt, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{formatNumber(organization._count.members)} Member(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span>{formatNumber(organization._count.posts)} Post(s)</span>
          </div>
        </div>
        {organization.description && (
          <>
            <Separator />
            <Linkify>
              <div className="overflow-hidden whitespace-pre-line break-words text-sm leading-relaxed">
                {organization.description}
              </div>
            </Linkify>
          </>
        )}
      </div>

      {isAdmin && (
        <OrganizationFab organization={organization} isAdmin={isAdmin} />
      )}
    </div>
  );
}
