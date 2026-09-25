import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import FollowingCount from "@/components/FollowingCount";
import Linkify from "@/components/Linkify";
import TrendsSidebar from "@/components/TrendsSidebar";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";

interface PageProps {
  params: Promise<{ username: string }> | { username: string };
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();

  return user;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const resolvedParams = await params;
  const user = await getUser(resolvedParams.username, loggedInUser.id);

  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

export default async function Page({ params }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const resolvedParams = await params;
  const user = await getUser(resolvedParams.username, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </div>
        <UserPosts userId={user.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}

import ShareProfileButton from "./ShareProfileButton";
import { Calendar, Users, FileText, CheckCircle2, Sparkles } from "lucide-react";

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all">
      {/* ── 1. Hero Cover Banner ────────────────────────────────────────── */}
      <div className="relative h-36 sm:h-44 w-full flex-shrink-0 overflow-hidden bg-gradient-to-tr from-primary/30 via-indigo-500/15 to-purple-600/20 dark:from-primary/20 dark:via-background dark:to-muted border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        {/* Floating Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide backdrop-blur-md bg-background/85 text-foreground shadow-sm border border-border/50">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Citizen Profile
          </span>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md bg-background/85 text-muted-foreground shadow-sm border border-border/50">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Verified Citizen</span>
          </div>
        </div>
      </div>

      {/* ── 2. Identity & Name Card Body ─────────────────────────────────── */}
      <div className="relative flex w-full flex-col gap-5 p-4 sm:p-6 lg:p-7">
        {/* Top Header Row: Anchor Avatar on left, Actions on right */}
        <div className="flex items-end justify-between gap-4 -mt-12 sm:-mt-14 md:-mt-16 mb-1">
          {/* Avatar Anchor */}
          <div className="relative flex-shrink-0 z-10">
            <UserAvatar
              avatarUrl={user.avatarUrl}
              size={120}
              className="size-20 sm:size-24 md:size-28 rounded-full border-4 border-card bg-card shadow-lg"
            />
          </div>

          {/* Action Buttons (Desktop & Tablet) */}
          <div className="flex items-center gap-2 pt-1 flex-wrap justify-end">
            {user.id === loggedInUserId ? (
              <EditProfileButton user={user} />
            ) : (
              <FollowButton userId={user.id} initialState={followerInfo} />
            )}
            <ShareProfileButton username={user.username} />
          </div>
        </div>

        {/* Title & User Information (FULL WIDTH) */}
        <div className="space-y-2 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-snug">
            {user.displayName}
          </h1>

          {/* Subtitle Row */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="font-semibold text-muted-foreground">@{user.username}</span>
            <CheckCircle2 className="size-4 text-primary fill-primary/20" />
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5 text-primary" />
              Member since {formatDate(user.createdAt, "MMMM yyyy")}
            </span>
          </div>
        </div>

        {/* ── 3. Quick Stats Ribbon (3 Grid Chips) ───────────────────────── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          {/* Posts Count */}
          <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-3 sm:p-3.5 border border-border/60 hover:bg-muted/60 transition-colors gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
              <FileText className="size-3.5 text-primary" />
              <span>Posts</span>
            </div>
            <div className="text-base sm:text-lg font-black text-foreground">
              {formatNumber(user._count.posts)}
            </div>
          </div>

          {/* Followers */}
          <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-3 sm:p-3.5 border border-border/60 hover:bg-muted/60 transition-colors gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
              <Users className="size-3.5 text-amber-500" />
              <span>Followers</span>
            </div>
            <div className="text-base sm:text-lg font-black text-foreground">
              <FollowerCount userId={user.id} initialState={followerInfo} />
            </div>
          </div>

          {/* Following */}
          <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-3 sm:p-3.5 border border-border/60 hover:bg-muted/60 transition-colors gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
              <Users className="size-3.5 text-blue-500" />
              <span>Following</span>
            </div>
            <div className="text-base sm:text-lg font-black text-foreground">
              <FollowingCount
                userId={user.id}
                followingCount={user._count.following}
              />
            </div>
          </div>
        </div>

        {/* ── 4. User Bio Narrative ───────────────────────────────────────── */}
        {user.bio && (
          <div className="space-y-2 pt-2">
            <div className="pt-2 border-t border-border/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                About Citizen
              </h3>
              <Linkify>
                <div className="overflow-hidden whitespace-pre-line break-words text-sm text-foreground/90 leading-relaxed">
                  {user.bio}
                </div>
              </Linkify>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
