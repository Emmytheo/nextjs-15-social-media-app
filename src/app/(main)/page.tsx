import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import { OrganizationFeed } from "@/app/(main)/organization/[org-name-id]/OrganizationFeed";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import HomeHeroCarousel from "./HomeHeroCarousel";
import PostEditor from "@/components/posts/editor/PostEditor";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  // Fetch all organizations the user belongs to or stewards
  let userOrganizations: any[] = [];
  let userEvents: any[] = [];

  try {
    const [orgs, events] = await Promise.all([
      prisma.organization.findMany({
        where: {
          OR: [
            { members: { some: { userId: user.id } } },
            { admins: { some: { userId: user.id } } },
          ],
        },
        include: {
          admins: {
            where: { userId: user.id },
            select: { userId: true },
          },
          _count: {
            select: { members: true, events: true, programs: true, posts: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.event.findMany({
        where: {
          OR: [
            {
              organization: {
                OR: [
                  { members: { some: { userId: user.id } } },
                  { admins: { some: { userId: user.id } } },
                ],
              },
            },
            {
              attendees: {
                some: { userId: user.id },
              },
            },
          ],
          isPublished: true,
        },
        include: {
          organization: {
            select: { id: true, name: true, logoUrl: true, bannerUrl: true },
          },
          attendees: {
            where: { userId: user.id },
            select: { id: true, status: true },
          },
        },
        orderBy: { startDate: "asc" },
        take: 3,
      }),
    ]);

    userOrganizations = orgs;
    userEvents = events;
  } catch (error) {
    console.error("Home feed query error:", error);
  }

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        {/* Unified Swipeable Hero Carousel */}
        <HomeHeroCarousel
          user={user}
          userOrganizations={userOrganizations}
          userEvents={userEvents}
        />

        {/* Post Composer */}
        <PostEditor />

        {/* Main Feed Tabs */}
        <Tabs defaultValue="for-you" className="w-full">
          <TabsList className="sticky top-[70px] z-10 flex w-full flex-wrap sm:w-auto sm:inline-flex justify-start gap-1.5 rounded-2xl border border-border/70 bg-card/95 p-1.5 backdrop-blur shadow-sm">
            <TabsTrigger
              value="for-you"
              className="flex-1 sm:flex-initial rounded-xl px-4 py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              For You
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 sm:flex-initial rounded-xl px-4 py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              Following
            </TabsTrigger>

            {/* Render a tab for each user organization */}
            {userOrganizations.map((org) => (
              <TabsTrigger
                key={org.id}
                value={`org-${org.id}`}
                className="flex-1 sm:flex-initial rounded-xl px-4 py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all truncate max-w-[170px]"
                title={org.name}
              >
                {org.name}
              </TabsTrigger>
            ))}

            {userOrganizations.length === 0 && (
              <TabsTrigger
                value="explore-guilds"
                className="flex-1 sm:flex-initial rounded-xl px-4 py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                Guilds
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="for-you" className="mt-4">
            <ForYouFeed />
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            <FollowingFeed />
          </TabsContent>

          {userOrganizations.map((org) => (
            <TabsContent key={org.id} value={`org-${org.id}`} className="mt-4">
              <OrganizationFeed organization={org} />
            </TabsContent>
          ))}

          {userOrganizations.length === 0 && (
            <TabsContent value="explore-guilds" className="mt-4">
              <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold">You haven't joined a community guild yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Guilds allow you to pool treasury funds, organize events, and manage collective crowdfunding schemes.
                  </p>
                </div>
                <Link href="/organization" className="inline-block pt-1">
                  <Button size="sm" className="rounded-xl font-bold gap-1.5 shadow-sm">
                    <Users className="h-4 w-4" />
                    Browse Community Guilds
                  </Button>
                </Link>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
