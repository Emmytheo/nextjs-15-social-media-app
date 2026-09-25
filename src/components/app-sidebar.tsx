"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Building2,
  Calendar,
  Home,
  LayoutDashboard,
  MessageSquare,
  Music,
  Bell,
  Bookmark,
  Settings,
  CircleHelp,
  Music2,
  Radio,
  Wallet,
  Coins,
  Crown,
  ChevronRight,
  ExternalLink,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Platform Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Global Feed",
      url: "/",
      icon: Home,
    },
    {
      title: "Communities Hub",
      url: "/organization",
      icon: Building2,
    },
    {
      title: "Events Gathering",
      url: "/events",
      icon: Calendar,
    },
    {
      title: "Crowdfunding Grants",
      url: "/crowdfunding",
      icon: Coins,
    },
    {
      title: "Fintech Vault & Escrow",
      url: "/wallet",
      icon: Wallet,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Bookmarks",
      url: "/bookmarks",
      icon: Bookmark,
    },
  ],
  navCreative: [
    {
      title: "Sol2Snd Engine",
      url: "/sol2snd",
      icon: Radio,
    },
    {
      title: "Music Studio",
      url: "/music",
      icon: Music2,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Help & Documentation",
      url: "#",
      icon: CircleHelp,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  managedCommunities?: Array<{ id: string; name: string; logoUrl: string | null }>;
}

export function AppSidebar({ managedCommunities = [], ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-amber-500 text-primary-foreground shadow-sm">
                  <span className="font-black text-xs">OS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-none">CommunityOS</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Platform Console</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Managed Communities Section (when user is an admin of guilds) */}
        {managedCommunities.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1.5">
                <Crown className="size-3.5" />
                My Admin Guilds ({managedCommunities.length})
              </span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managedCommunities.map((org) => (
                  <SidebarMenuItem key={org.id}>
                    <SidebarMenuButton asChild tooltip={`Manage ${org.name}`}>
                      <Link href={`/dashboard/organization/${org.id}`} className="flex items-center gap-2 text-xs font-semibold">
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 overflow-hidden border border-border/60">
                          {org.logoUrl ? (
                            <Image src={org.logoUrl} alt={org.name} width={20} height={20} className="object-cover size-full" />
                          ) : (
                            <Building2 className="size-3 text-primary" />
                          )}
                        </div>
                        <span className="truncate">{org.name}</span>
                        <ChevronRight className="size-3 ml-auto opacity-40" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <NavMain items={data.navMain} />

        {/* Creative Tools section */}
        <div className="mt-2">
          <NavMain
            items={data.navCreative}
            label="Creative Tools"
          />
        </div>

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
