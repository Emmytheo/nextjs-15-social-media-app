import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import {
  Building2,
  Calendar,
  Clock,
  Crown,
  Loader2,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Users,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 lg:block xl:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin text-primary" />}>
        <MyGuildsSidebar />
        <UpcomingEventsSidebar />
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function MyGuildsSidebar() {
  try {
    const { user } = await validateRequest();
    if (!user) return null;

    const userGuilds = await prisma.organization.findMany({
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
          select: { members: true, events: true },
        },
      },
      orderBy: { name: "asc" },
      take: 4,
    });

    if (userGuilds.length === 0) return null;

    return (
      <div className="space-y-3.5 rounded-2xl bg-card p-4 shadow-sm border border-border/60">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            My Sovereign Guilds
          </div>
          <Link
            href="/organization?scope=my-guilds"
            className="text-[11px] font-semibold text-primary hover:underline flex items-center"
          >
            All ({userGuilds.length})
            <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {userGuilds.map((org) => {
            const isOrgAdmin = org.admins.length > 0;
            return (
              <div
                key={org.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Link
                  href={`/organization/${org.id}`}
                  className="flex items-center gap-2.5 min-w-0 flex-1 group"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden font-bold text-[10px] text-primary border border-border/60">
                    {org.logoUrl ? (
                      <Image
                        src={org.logoUrl}
                        alt={org.name}
                        width={28}
                        height={28}
                        className="object-cover size-full"
                      />
                    ) : (
                      org.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                      {org.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {isOrgAdmin ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                          <Crown className="size-2.5" />
                          Steward
                        </span>
                      ) : (
                        <span className="text-primary font-semibold flex items-center gap-0.5">
                          <ShieldCheck className="size-2.5" />
                          Member
                        </span>
                      )}
                      <span>·</span>
                      <span>{org._count.members} citizens</span>
                    </p>
                  </div>
                </Link>
                <Link
                  href={`/organization/${org.id}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors p-1"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (err) {
    console.error("MyGuildsSidebar error:", err);
    return null;
  }
}

async function UpcomingEventsSidebar() {
  try {
    const { user } = await validateRequest();
    if (!user) return null;

    const upcomingEvents = await prisma.event.findMany({
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
          select: { id: true, name: true },
        },
      },
      orderBy: { startDate: "asc" },
      take: 3,
    });

    if (upcomingEvents.length === 0) return null;

    return (
      <div className="space-y-3.5 rounded-2xl bg-card p-4 shadow-sm border border-border/60">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-500" />
            Upcoming Gatherings
          </div>
          <Link
            href="/events?scope=my-guilds"
            className="text-[11px] font-semibold text-primary hover:underline flex items-center"
          >
            All
            <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {upcomingEvents.map((evt) => {
            const startDate = new Date(evt.startDate);
            return (
              <Link
                key={evt.id}
                href={`/events/${evt.id}`}
                className="block p-2.5 rounded-xl hover:bg-muted/50 transition-colors border border-border/40 space-y-1 group"
              >
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="font-bold text-primary truncate max-w-[150px]">
                    {evt.organization?.name}
                  </span>
                  <Badge variant="outline" className="text-[9px] py-0 h-3.5 font-bold px-1">
                    {evt.ticketType === "FREE" ? "Free" : evt.ticketPrice ? `$${evt.ticketPrice}` : "Paid"}
                  </Badge>
                </div>
                <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {evt.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Clock className="size-2.5 shrink-0" />
                  <span>{formatDate(startDate, "MMM d, h:mm a")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  } catch (err) {
    console.error("UpcomingEventsSidebar error:", err);
    return null;
  }
}

async function WhoToFollow() {
  try {
    const { user } = await validateRequest();

    if (!user) return null;

    const usersToFollow = await prisma.user.findMany({
      where: {
        NOT: {
          id: user.id,
        },
        followers: {
          none: {
            followerId: user.id,
          },
        },
      },
      select: getUserDataSelect(user.id),
      take: 5,
    });

    return (
      <div className="space-y-4 rounded-2xl bg-card p-5 shadow-sm border border-border/60">
        <div className="text-base font-bold flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Who to follow
        </div>
        {usersToFollow.length > 0 ? (
          usersToFollow.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-2">
              <UserTooltip user={u}>
                <Link
                  href={`/users/${u.username}`}
                  className="flex items-center gap-2 min-w-0"
                >
                  <UserAvatar avatarUrl={u.avatarUrl} className="flex-none" size={36} />
                  <div className="min-w-0">
                    <p className="line-clamp-1 break-all font-semibold hover:underline text-xs text-foreground">
                      {u.displayName}
                    </p>
                    <p className="line-clamp-1 break-all text-muted-foreground text-[11px]">
                      @{u.username}
                    </p>
                  </div>
                </Link>
              </UserTooltip>
              <FollowButton
                userId={u.id}
                initialState={{
                  followers: u._count.followers,
                  isFollowedByUser: u.followers.some(
                    ({ followerId }) => followerId === u.id,
                  ),
                }}
              />
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/80 p-3 text-center space-y-1">
            <p className="text-xs font-semibold text-foreground">Connected with community</p>
            <p className="text-[10px] text-muted-foreground">Explore autonomous guild members.</p>
            <Link href="/organization" className="text-[11px] text-primary font-bold hover:underline inline-block pt-0.5">
              Browse Guilds →
            </Link>
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error("WhoToFollow query error:", err);
    return null;
  }
}

const DEFAULT_TRENDS = [
  { hashtag: "#CommunityOS", count: 24 },
  { hashtag: "#EscrowVault", count: 18 },
  { hashtag: "#CoptellerMFB", count: 15 },
  { hashtag: "#AgriCooperative", count: 11 },
  { hashtag: "#CivicGrants", count: 8 },
];

const getTrendingTopics = unstable_cache(
  async () => {
    try {
      const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
              SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
              FROM posts
              GROUP BY (hashtag)
              ORDER BY count DESC, hashtag ASC
              LIMIT 5
          `;

      if (!result || result.length === 0) {
        return DEFAULT_TRENDS;
      }

      return result.map((row) => ({
        hashtag: row.hashtag,
        count: Number(row.count),
      }));
    } catch (error) {
      console.error("getTrendingTopics fallback error:", error);
      return DEFAULT_TRENDS;
    }
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60,
  },
);

async function TrendingTopics() {
  let trendingTopics = DEFAULT_TRENDS;
  try {
    const fetched = await getTrendingTopics();
    if (fetched && fetched.length > 0) {
      trendingTopics = fetched;
    }
  } catch (err) {
    console.error("TrendingTopics load error:", err);
  }

  return (
    <div className="space-y-4 rounded-2xl bg-card p-5 shadow-sm border border-border/60">
      <div className="text-base font-bold flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Trending Topics
      </div>
      {trendingTopics.map(({ hashtag, count }) => (
        <Link
          key={hashtag}
          href={`/hashtag/${hashtag.slice(1)}`}
          className="block"
        >
          <p
            className="line-clamp-1 break-all font-semibold hover:underline text-xs"
            title={hashtag}
          >
            {hashtag}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {formatNumber(count)} {count === 1 ? "post" : "posts"}
          </p>
        </Link>
      ))}
    </div>
  );
}
