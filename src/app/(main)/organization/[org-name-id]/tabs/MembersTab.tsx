"use client";

import { useQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";
import { OrganizationWithCounts } from "../page";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMemberFromOrganization } from "../member-actions";
import { InviteMemberForm } from "../InviteMemberForm";
import { UserX, Users, Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { validateRequest } from "@/auth";
import { User } from "lucia";

interface MembersTabProps {
  organization: OrganizationWithCounts;
  loggedInUser?: User | null;
  isAdmin?: boolean;
}

export interface OrganizationMember {
  userId: string;
  joinedAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  return ky.get(`/api/organizations/${organizationId}/members`).json();
}

export function MembersTab({ organization, loggedInUser, isAdmin }: MembersTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const { data: members, isLoading } = useQuery({
    queryKey: ["organization-members", organization.id],
    queryFn: () => getOrganizationMembers(organization.id),
  });

  // Check if current user is admin
  // const isAdmin = organization.admins?.some((admin: { userId: string; }) => admin.userId === loggedInUser.id) || false; // This would need to be implemented with actual auth

  const removeMemberMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      removeMemberFromOrganization(organization.id, userId),
    onSuccess: (result) => {
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ["organization-members", organization.id],
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-5">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Members ({organization._count.members})
          </h3>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({organization._count.members})
          </h3>

          <div className="flex gap-2">
            {isAdmin && <InviteMemberForm organizationId={organization.id} />}
          </div>
        </div>

        {members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => {
              const isMemberAdmin = organization.admins?.some((admin: { userId: string; }) => admin.userId === member.userId) || false;

              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Link
                      href={`/users/${member.user.username}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.avatarUrl || undefined} />
                        <AvatarFallback>
                          {member.user.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs md:text-sm font-medium">{member.user.displayName}</p>
                          {isMemberAdmin && (
                            <span className="text-xs md:text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          @{member.user.username}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Joined {formatDate(member.joinedAt, "MMM d, yyyy")}
                    </span>

                    {isAdmin && loggedInUser && member.userId !== loggedInUser.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm(`Remove ${member.user.displayName} from this organization?`)) {
                                removeMemberMutation.mutate({ userId: member.userId });
                              }
                            }}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your community by inviting members to join {organization.name}.
            </p>
            {isAdmin && <InviteMemberForm organizationId={organization.id} />}
          </Card>
        )}
      </div>
    </div>
  );
}
