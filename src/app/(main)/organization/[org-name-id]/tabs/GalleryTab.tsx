"use client";

import { OrganizationWithCounts } from "../page";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as LucideImage, Video, Calendar, Camera } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { OrganizationGallery } from "@prisma/client";
import { formatDate } from "date-fns";
import { CreateGalleryItemForm } from "../CreateGalleryItemForm";

interface GalleryTabProps {
  organization: OrganizationWithCounts;
  isAdmin?: boolean;
}

interface GalleryItemWithRelations extends OrganizationGallery {
  user: { displayName: string; avatarUrl: string | null };
  activity: { title: string } | null;
  program: { title: string } | null;
}

export function GalleryTab({ organization, isAdmin }: GalleryTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["organization-gallery", organization.id],
    queryFn: () =>
      kyInstance
        .get(`/api/organizations/${organization.id}/gallery`)
        .json<{ galleryItems: GalleryItemWithRelations[] }>(),
  });

  const galleryItems = data?.galleryItems || [];

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Gallery
        </h3>
        {isAdmin && <CreateGalleryItemForm organizationId={organization.id} />}
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photos">Photos & Videos</TabsTrigger>
          <TabsTrigger value="highlights">Activity Highlights</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="mt-6">
          <div className="space-y-6">
            Capture and share memorable moments from {organization.name}&apos;s events and activities.

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-video bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : galleryItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative bg-muted">
                      {item.type === "IMAGE" ? (
                        <Image
                          src={item.url}
                          alt={item.title || "Gallery item"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" controls />
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant={item.type === "VIDEO" ? "destructive" : "secondary"} className="text-xs">
                          {item.type === "VIDEO" ? (
                            <>
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </>
                          ) : (
                            <>
                              <LucideImage className="w-3 h-3 mr-1" />
                              Photo
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2 text-white/80 text-xs bg-black/50 px-2 py-1 rounded-full">
                        {formatDate(item.createdAt, "MMM d, yyyy")}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-1 truncate">
                        {item.title || "Untitled"}
                      </h4>
                      {item.caption && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {item.caption}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.program && (
                          <Badge variant="outline" className="text-[10px]">
                            {item.program.title}
                          </Badge>
                        )}
                        {item.activity && (
                          <Badge variant="outline" className="text-[10px]">
                            {item.activity.title}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold mb-2">No Media Yet</h4>
                <p className="text-muted-foreground">
                  Gallery will populate as {organization.name} shares photos and videos from events.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="highlights" className="mt-6">
          <div className="text-center py-8 text-muted-foreground">
            Activity highlights feature coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
