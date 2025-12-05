"use client";

import { OrganizationWithCounts } from "../page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "date-fns";
import { Calendar, Users, MapPin, Clock, Trophy, Award, Target, Folder, Loader2, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { CreateOrganizationProgramForm } from "../CreateOrganizationProgramForm";
import { ViewProgramModal } from "../ViewProgramModal";
import { ProgramStatus } from "@prisma/client";
import { OrganizationProgramData } from "@/lib/types";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ProgramsTabProps {
  organization: OrganizationWithCounts;
  isAdmin?: boolean;
}

// ... (interfaces remain same)

export function ProgramsTab({ organization, isAdmin }: ProgramsTabProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["organization-programs", organization.id],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/organizations/${organization.id}/programs`,
          pageParam ? { searchParams: { cursor: String(pageParam) } } : undefined
        )
        .json<OrganizationProgramsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const programs = data?.pages.flatMap((page) => page.programs) || [];

  const activePrograms = programs.filter(p => p.status === ProgramStatus.ACTIVE);
  const totalEvents = programs.reduce((acc, p) => acc + p._count.events, 0);
  const totalActivities = programs.reduce((acc, p) => acc + p._count.activities, 0);

  if (status === "pending") {
    return (
      <div className="rounded-2xl bg-card p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Programs
          </h3>
          {isAdmin && <CreateOrganizationProgramForm organizationId={organization.id} />}
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Programs
        </h3>
        {isAdmin && <CreateOrganizationProgramForm organizationId={organization.id} />}
      </div>

      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-2 md:p-4">
            <div className="flex items-center gap-1 md:gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{activePrograms.length}</p>
                <p className="text-xs text-muted-foreground truncate line-clamp-1 whitespace-nowrap">Active Programs</p>
              </div>
            </div>
          </Card>
          <Card className="p-2 md:p-4">
            <div className="flex items-center gap-1 md:gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{totalEvents}</p>
                <p className="text-xs text-muted-foreground truncate line-clamp-1 whitespace-nowrap">Total Events</p>
              </div>
            </div>
          </Card>
          <Card className="p-2 md:p-4">
            <div className="flex items-center gap-1 md:gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{totalActivities}</p>
                <p className="text-xs text-muted-foreground truncate line-clamp-1 whitespace-nowrap">Total Activities</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Programs List */}
        <div>
          <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Organization Programs
          </h4>
          {programs.length > 0 ? (
            <InfiniteScrollContainer
              className="space-y-5"
              onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
            >
              {programs.map((program, index) => (
                <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg leading-tight">{program.title}</CardTitle>
                          <Badge
                            variant={program.status === ProgramStatus.ACTIVE ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {program.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={program.user.avatarUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {program.user.displayName.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{program.user.displayName}</span>
                          </div>
                          <span>•</span>
                          <span>{formatDate(program.createdAt, "MMM d, yyyy")}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {program._count.events} events
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {program._count.activities} activities
                          </div>
                        </div>
                        {program.startDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Calendar className="w-3 h-3" />
                            Start: {formatDate(program.startDate, "MMM d, yyyy")}
                          </div>
                        )}
                        {program.endDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <Calendar className="w-3 h-3" />
                            End: {formatDate(program.endDate, "MMM d, yyyy")}
                          </div>
                        )}
                        {program.category && (
                          <Badge variant="outline" className="w-fit text-xs mb-2">
                            {program.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {program.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {program.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm">
                          Manage Program
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
            </InfiniteScrollContainer>
          ) : (
            <Card className="p-8 text-center">
              <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
              <p className="text-muted-foreground mb-4">
                Programs will showcase initiatives, projects, and long-term commitments organized by {organization.name}.
              </p>
              {isAdmin && <CreateOrganizationProgramForm organizationId={organization.id} />}
            </Card>
          )}
        </div>

        {/* Call to Action */}
        {isAdmin && (
          <Card className="p-6 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
            <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h4 className="text-lg font-semibold mb-2">Ready to Launch Your Next Program?</h4>
            <p className="text-muted-foreground mb-4">
              Create structured initiatives and manage long-term projects through {organization.name}.
            </p>
            <CreateOrganizationProgramForm organizationId={organization.id} />
          </Card>
        )}
      </div>
    </div>
  );
}
