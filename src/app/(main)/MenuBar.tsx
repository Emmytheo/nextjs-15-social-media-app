import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import Link from "next/link";
import Image from "next/image";
import { Building2, PlusCircle, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookmarksButton from "./BookmarksButton";
import HomeButton from "./HomeButton";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";
import OrganizationButton from "./OrganizationsButton";
import CrowdfundingButton from "./CrowdfundingButton";
import WalletButton from "./WalletButton";
import EventsButton from "./EventsButton";
import DashboardButton from "./DashboardButton";
import MusicButton from "./MusicButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  if (!user) return null;

  let unreadNotificationsCount = 0;
  let unreadMessagesCount = 0;
  let userGuilds: Array<{ id: string; name: string; logoUrl: string | null }> = [];

  try {
    const [notifCount, streamData, guilds] = await Promise.allSettled([
      prisma.notification.count({
        where: {
          recipientId: user.id,
          read: false,
        },
      }),
      streamServerClient.getUnreadCount(user.id),
      prisma.organization.findMany({
        where: {
          OR: [
            { members: { some: { userId: user.id } } },
            { admins: { some: { userId: user.id } } },
          ],
        },
        select: { id: true, name: true, logoUrl: true },
        orderBy: { name: "asc" },
        take: 4,
      }),
    ]);

    if (notifCount.status === "fulfilled") {
      unreadNotificationsCount = notifCount.value;
    }
    if (streamData.status === "fulfilled") {
      unreadMessagesCount = streamData.value.total_unread_count;
    }
    if (guilds.status === "fulfilled") {
      userGuilds = guilds.value;
    }
  } catch (error) {
    console.error("Error loading MenuBar unread counts:", error);
  }

  return (
    <div className={className}>
      {/* Primary Section */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 hidden lg:block">
          Core Hubs
        </div>
        <HomeButton />
        <CrowdfundingButton />
        <WalletButton />
        <EventsButton />
        <OrganizationButton />
      </div>

      {/* User's Affiliated Guilds Section */}
      {userGuilds.length > 0 && (
        <>
          <div className="my-2 border-t border-border/50" />
          <div className="space-y-1">
            <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 hidden lg:flex">
              <span>My Guilds ({userGuilds.length})</span>
              <Link href="/organization?scope=my-guilds" className="text-primary hover:underline lowercase text-[10px]">
                all
              </Link>
            </div>
            {userGuilds.map((org) => (
              <Button
                key={org.id}
                variant="ghost"
                className="flex items-center justify-start gap-2.5 w-full px-3 py-2 h-auto"
                title={org.name}
                asChild
              >
                <Link href={`/organization/${org.id}`}>
                  <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center font-black text-[9px] text-primary shrink-0 overflow-hidden border border-border/50">
                    {org.logoUrl ? (
                      <Image src={org.logoUrl} alt={org.name} width={20} height={20} className="object-cover size-full" />
                    ) : (
                      org.name.substring(0, 1).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold truncate max-w-[130px]">
                    {org.name}
                  </span>
                </Link>
              </Button>
            ))}
          </div>
        </>
      )}

      <div className="my-2 border-t border-border/50" />

      {/* Social & Communications Section */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 hidden lg:block">
          Social & Alerts
        </div>
        <NotificationsButton
          initialState={{ unreadCount: unreadNotificationsCount }}
        />
        <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
        <BookmarksButton />
      </div>

      <div className="my-2 border-t border-border/50" />

      {/* Creative & Media Section */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 hidden lg:block">
          Media & Studio
        </div>
        <MusicButton />
      </div>

      <div className="my-2 border-t border-border/50" />

      {/* Platform Command Section */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 hidden lg:block">
          System
        </div>
        <DashboardButton />
      </div>

      {/* Quick Launch CTA */}
      <div className="pt-2 hidden lg:block">
        <Link
          href="/crowdfunding/create"
          className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-amber-500 p-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-95"
        >
          <Sparkles className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-12" />
          <span>Launch Campaign</span>
        </Link>
      </div>
    </div>
  );
}
