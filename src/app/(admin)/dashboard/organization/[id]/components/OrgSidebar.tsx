"use client";

import * as React from "react";
import {
    ChartBar,
    Calendar,
    Camera,
    Home,
    Image,
    LayoutDashboard,
    Settings,
    Star,
    Users,
    BookOpen,
    CircleArrowUp,
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
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OrgSidebarProps extends React.ComponentProps<typeof Sidebar> {
    organizationId: string;
    organizationName: string;
}

export function OrgSidebar({
    organizationId,
    organizationName,
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
            title: "Programs",
            url: `${baseUrl}/programs`,
            icon: BookOpen,
            isActive: pathname.startsWith(`${baseUrl}/programs`),
        },
        {
            title: "Activities",
            url: `${baseUrl}/activities`,
            icon: Calendar,
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
            icon: Image,
            isActive: pathname.startsWith(`${baseUrl}/gallery`),
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
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={baseUrl}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <CircleArrowUp className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {organizationName}
                                    </span>
                                    <span className="truncate text-xs">Organization Dashboard</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.isActive}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
