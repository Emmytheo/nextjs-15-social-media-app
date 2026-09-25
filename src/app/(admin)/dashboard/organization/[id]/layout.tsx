import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { OrgSidebar } from "./components/OrgSidebar";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, Home } from "lucide-react";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
    const { user } = await validateRequest();

    if (!user) {
        redirect("/login");
    }

    const { id } = await params;

    // Check if user is a member or admin and fetch user organizations in parallel
    const [organization, membership, adminRecord, userOrganizations] = await Promise.all([
        prisma.organization.findUnique({
            where: { id },
            select: { id: true, name: true, logoUrl: true },
        }),
        prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: user.id,
                    organizationId: id,
                },
            },
        }),
        prisma.organizationAdmin.findFirst({
            where: {
                userId: user.id,
                organizationId: id,
            },
        }),
        prisma.organization.findMany({
            where: {
                OR: [
                    { admins: { some: { userId: user.id } } },
                    { members: { some: { userId: user.id } } },
                ],
            },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                admins: {
                    where: { userId: user.id },
                    select: { userId: true },
                },
            },
            orderBy: { name: "asc" },
        }),
    ]);

    if (!organization) {
        redirect("/");
    }

    if (!membership && !adminRecord) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
                <div className="max-w-md w-full bg-card rounded-3xl p-8 border shadow-lg text-center space-y-5">
                    <div className="size-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight">Organization Access Restricted</h2>
                        <p className="text-sm text-muted-foreground">
                            You are not an enrolled administrator or member of <span className="font-semibold text-foreground">{organization.name}</span>.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                        <Button asChild className="rounded-xl font-semibold">
                            <Link href={`/organization/${organization.id}`}>
                                View Public Community Profile
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl font-medium">
                            <Link href="/dashboard">
                                Back to Platform Overview
                            </Link>
                        </Button>
                        <Link
                            href="/"
                            className="text-xs text-muted-foreground hover:underline pt-1"
                        >
                            Return to Main Feed
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <OrgSidebar
                organizationId={organization.id}
                organizationName={organization.name}
                organizationLogo={organization.logoUrl}
                isAdmin={!!adminRecord}
                userOrganizations={userOrganizations.map((o) => ({
                    id: o.id,
                    name: o.name,
                    logoUrl: o.logoUrl,
                    isAdmin: o.admins.length > 0,
                }))}
            />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-card/60 backdrop-blur transition-[width,height] ease-linear">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden sm:block">
                                    <BreadcrumbLink href="/dashboard" className="text-xs font-medium">
                                        Overview
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden sm:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-semibold text-xs text-foreground truncate max-w-[160px] sm:max-w-xs">
                                        {organization.name}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 rounded-lg">
                            <Link href={`/organization/${organization.id}`} target="_blank">
                                <Globe className="size-3.5 text-primary" />
                                <span className="hidden sm:inline">Public Profile</span>
                                <ExternalLink className="size-3 text-muted-foreground" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-semibold gap-1 rounded-lg">
                            <Link href="/">
                                <Home className="size-3.5" />
                                <span className="hidden sm:inline">Feed</span>
                            </Link>
                        </Button>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
