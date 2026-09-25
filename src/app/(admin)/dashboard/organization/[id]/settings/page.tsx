import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Globe,
  Lock,
  Bell,
  Building2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrgSettingsPage({ params }: PageProps) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { id } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      admins: { where: { userId: user.id } },
    },
  });

  if (!organization) redirect("/");

  const isAdmin = organization.admins.length > 0;

  const settingsSections = [
    {
      title: "Profile & Branding",
      description: "Update your community name, description, logo, and cover image.",
      icon: Building2,
      href: `/organization/${encodeURIComponent(organization.name)}`,
      action: "Edit on Public Profile",
    },
    {
      title: "Privacy & Visibility",
      description: "Control who can see your community, join, and post content.",
      icon: Lock,
      href: "#",
      action: "Manage Settings",
      disabled: true,
      badge: "Coming Soon",
    },
    {
      title: "Notifications",
      description: "Configure email and push notification preferences for your community.",
      icon: Bell,
      href: "#",
      action: "Configure",
      disabled: true,
      badge: "Coming Soon",
    },
    {
      title: "Public Profile URL",
      description: `Your community is publicly accessible at /organization/${encodeURIComponent(organization.name)}`,
      icon: Globe,
      href: `/organization/${encodeURIComponent(organization.name)}`,
      action: "View Public Page",
      external: true,
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="size-6" />
          Community Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage settings for <span className="font-medium">{organization.name}</span>
        </p>
      </div>

      {/* Community Identity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Community Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl overflow-hidden border bg-muted flex items-center justify-center shrink-0">
              {organization.logoUrl ? (
                <Image src={organization.logoUrl} alt={organization.name} width={64} height={64} className="object-cover" />
              ) : (
                <Building2 className="size-8 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-lg">{organization.name}</p>
              {organization.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{organization.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
          <CardDescription>Manage how your community looks and behaves.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {settingsSections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                {i > 0 && <Separator />}
                <div className="flex items-start gap-4 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{section.title}</p>
                      {section.badge && (
                        <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground text-xs px-2 py-0.5">
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  </div>
                  <Button
                    asChild={!section.disabled}
                    variant="ghost"
                    size="sm"
                    disabled={section.disabled}
                    className="shrink-0 gap-1 text-xs"
                  >
                    {section.disabled ? (
                      <span>{section.action}</span>
                    ) : (
                      <Link
                        href={section.href}
                        {...(section.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="flex items-center gap-1"
                      >
                        {section.action}
                        {section.external ? (
                          <ExternalLink className="size-3" />
                        ) : (
                          <ChevronRight className="size-3" />
                        )}
                      </Link>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isAdmin && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions that affect your entire community.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Deactivate Community</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This will hide the community from the public directory. Data will be preserved.
                </p>
              </div>
              <Button variant="destructive" size="sm" disabled className="shrink-0">
                Deactivate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
