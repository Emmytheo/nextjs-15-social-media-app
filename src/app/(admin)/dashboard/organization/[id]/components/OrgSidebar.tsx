"use client";

import * as React from "react";
import {
  ChartBar,
  Calendar,
  Camera,
  Home,
  Image as LucideImage,
  LayoutDashboard,
  Settings,
  Star,
  Users,
  BookOpen,
  CircleArrowUp,
  Activity,
  Globe,
  ChevronsUpDown,
  Building2,
  Plus,
  Check,
  Crown,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface UserOrganizationOption {
  id: string;
  name: string;
  logoUrl: string | null;
  isAdmin: boolean;
}

interface OrgSidebarProps extends React.ComponentProps<typeof Sidebar> {
  organizationId: string;
  organizationName: string;
  organizationLogo?: string | null;
  isAdmin?: boolean;
  userOrganizations?: UserOrganizationOption[];
}

export function OrgSidebar({
  organizationId,
  organizationName,
  organizationLogo,
  isAdmin = false,
  userOrganizations = [],
  className,
  ...props
}: OrgSidebarProps) {
  const pathname = usePathname();
  const baseUrl = `/dashboard/organization/${organizationId}`;

  const navItems = [
    {
      title: "Overview",
      url: baseUrl,
      icon: LayoutDashboard,
      isActive: pathname === baseUrl,
    },
    {
      title: "Events",
      url: `${baseUrl}/events`,
      icon: Calendar,
      isActive: pathname.startsWith(`${baseUrl}/events`),
    },
    {
      title: "Programs",
      url: `${baseUrl}/programs`,
      icon: BookOpen,
      isActive: pathname.startsWith(`${baseUrl}/programs`),
    },
    {
      title: "Activities",
      url: `${baseUrl}/activities`,
      icon: Activity,
      isActive: pathname.startsWith(`${baseUrl}/activities`),
    },
    {
      title: "Highlights",
      url: `${baseUrl}/highlights`,
      icon: Star,
      isActive: pathname.startsWith(`${baseUrl}/highlights`),
    },
    {
      title: "Gallery",
      url: `${baseUrl}/gallery`,
      icon: LucideImage,
      isActive: pathname.startsWith(`${baseUrl}/gallery`),
    },
    {
      title: "Treasury & Escrow",
      url: `${baseUrl}/treasury`,
      icon: ChartBar,
      isActive: pathname.startsWith(`${baseUrl}/treasury`),
    },
    {
      title: "Members",
      url: `${baseUrl}/members`,
      icon: Users,
      isActive: pathname.startsWith(`${baseUrl}/members`),
    },
    {
      title: "Settings",
      url: `${baseUrl}/settings`,
      icon: Settings,
      isActive: pathname.startsWith(`${baseUrl}/settings`),
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 overflow-hidden border border-border/60 text-primary shrink-0">
                    {organizationLogo ? (
                      <Image
                        src={organizationLogo}
                        alt={organizationName}
                        width={32}
                        height={32}
                        className="object-cover size-full"
                      />
                    ) : (
                      <Building2 className="size-4" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-bold">{organizationName}</span>
                    <span className="truncate text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      {isAdmin ? (
                        <>
                          <Crown className="size-2.5 text-amber-500" />
                          <span>Admin Console</span>
                        </>
                      ) : (
                        <span>Member Portal</span>
                      )}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-2xl p-2 shadow-xl"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Switch Managed Guild
                </DropdownMenuLabel>
                {userOrganizations.map((org) => (
                  <DropdownMenuItem key={org.id} asChild className="rounded-xl cursor-pointer">
                    <Link
                      href={`/dashboard/organization/${org.id}`}
                      className="flex items-center justify-between gap-2 p-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 overflow-hidden text-primary border text-xs">
                          {org.logoUrl ? (
                            <Image src={org.logoUrl} alt={org.name} width={24} height={24} className="object-cover" />
                          ) : (
                            <Building2 className="size-3" />
                          )}
                        </div>
                        <span className="truncate text-xs font-semibold">{org.name}</span>
                      </div>
                      {org.id === organizationId && (
                        <Check className="size-3.5 text-primary shrink-0" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/dashboard" className="flex items-center gap-2 p-2 text-xs font-semibold">
                    <LayoutDashboard className="size-3.5 text-muted-foreground" />
                    <span>Platform Overview</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/organization" className="flex items-center gap-2 p-2 text-xs font-semibold">
                    <Plus className="size-3.5 text-primary" />
                    <span>Create New Guild</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
            Guild Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                    className="font-semibold text-xs"
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="mb-2 px-2 space-y-1">
          <Link
            href={`/organization/${organizationId}`}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
          >
            <Globe className="size-3.5 text-primary" />
            <span>Public Profile</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Platform Overview</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
          >
            <Home className="size-3.5" />
            <span>Main Feed</span>
          </Link>
        </div>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
