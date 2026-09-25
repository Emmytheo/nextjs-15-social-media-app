import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Crown,
  UserPlus,
  Search,
  Mail,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrgMembersPage({ params }: PageProps) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { id } = await params;

  const raw = await prisma.organization.findUnique({
    where: { id },
    include: {
      admins: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: { assignedAt: "asc" },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
      },
    },
  });

  if (!raw) redirect("/");

  // cast to access included relations
  const organization = raw as typeof raw & {
    name: string;
    admins: Array<{ userId: string; assignedAt: Date; user: { id: string; username: string; displayName: string; avatarUrl: string | null; email: string | null; createdAt: Date } }>;
    members: Array<{ userId: string; joinedAt: Date; user: { id: string; username: string; displayName: string; avatarUrl: string | null; email: string | null; createdAt: Date } }>;
  };

  const adminIds = new Set(organization.admins.map((a) => a.userId));
  const regularMembers = organization.members.filter((m) => !adminIds.has(m.userId));

  const stats = [
    { label: "Total Members", value: organization.members.length + organization.admins.length, icon: Users },
    { label: "Admins", value: organization.admins.length, icon: Shield },
    { label: "Regular Members", value: regularMembers.length, icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="size-6" />
            Community Members
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {organization.members.length} member{organization.members.length !== 1 ? "s" : ""} in{" "}
            <span className="font-medium">{organization.name}</span>
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/organization/${encodeURIComponent(organization.name)}`}>
            <UserPlus className="size-4" />
            Invite Members
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="size-4 text-yellow-500" />
            Admins
          </CardTitle>
          <CardDescription>Members with full management access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {organization.admins.map((admin) => (
              <div
                key={admin.userId}
                className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/30 transition-colors"
              >
                <Avatar className="size-10">
                  <AvatarImage src={admin.user.avatarUrl ?? undefined} />
                  <AvatarFallback>{admin.user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/users/${admin.user.username}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {admin.user.displayName}
                    </Link>
                    <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 font-medium">
                      Admin
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">@{admin.user.username}</p>
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Since {formatDate(admin.assignedAt, "MMM d, yyyy")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            All Members
          </CardTitle>
          <CardDescription>{regularMembers.length} regular member{regularMembers.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          {regularMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Users className="size-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No members yet</p>
              <p className="text-xs mt-1">Invite people to join your community.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {regularMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/30 transition-colors group"
                >
                  <Avatar className="size-10">
                    <AvatarImage src={member.user.avatarUrl ?? undefined} />
                    <AvatarFallback>{member.user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/users/${member.user.username}`}
                      className="font-medium text-sm hover:underline block"
                    >
                      {member.user.displayName}
                    </Link>
                    <p className="text-xs text-muted-foreground">@{member.user.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Joined {formatDate(member.joinedAt, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
