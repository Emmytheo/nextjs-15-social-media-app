import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import { OrganizationFeed } from "@/app/(main)/organization/[org-name-id]/OrganizationFeed";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CreateOrganizationForm } from "@/app/(main)/organization/[org-name-id]/CreateOrganizationForm";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@radix-ui/react-dialog";
import Link from "next/link";
import WelcomeHome from "./WelcomeHome";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }
  const organization = user
    ? await prisma.organization.findFirst({
      where: { members: { some: { userId: user.id } } },
    })
    : null;
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <WelcomeHome user={user} />

        <Tabs defaultValue="for-you">
          <TabsList className="sticky top-[70px] shadow-md z-10">
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="organization">Organizations</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
          {organization && (
            <TabsContent value="organization">
              <OrganizationFeed organization={organization} />
            </TabsContent>
          )}
          {!organization && (
            <TabsContent value="organization">
              <CreateOrganizationForm />
            </TabsContent>
          )}
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
