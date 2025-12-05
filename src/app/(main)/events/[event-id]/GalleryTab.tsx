"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as LucideImage, Video, Calendar, Camera, Share, Download, Loader2 } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

interface EventGalleryItem {
  id: string;
  eventId: string;
  mediaId: string;
  media: {
    id: string;
    type: "IMAGE" | "VIDEO";
    url: string;
    createdAt: Date;
  };
  caption: string | null;
  createdAt: Date;
}

interface GalleryResponse {
  galleryItems: EventGalleryItem[];
}

interface GalleryTabProps {
  eventId: string;
}

// Mock data for activity highlights (kept as placeholder for now as requested)
const activityHighlights = [
  {
    id: "1",
    title: "Keynote Speech: Future of Technology",
    description: "Dr. Sarah Chen presented groundbreaking research on emerging technologies",
    time: "10:00 AM",
    location: "Main Auditorium",
    attendees: 200,
    highlights: ["Machine Learning breakthroughs", "Real-world applications", "Q&A session"]
  },
  {
    id: "2",
    title: "Panel Discussion: Innovation in Communities",
    description: "Local leaders shared successful community development stories",
    time: "2:30 PM",
    location: "Conference Room A",
    attendees: 80,
    highlights: ["Grassroots initiatives", "Sustainable solutions", "Collaboration strategies"]
  },
  {
    id: "3",
    title: "Breakout Sessions",
    description: "Small group discussions on specialized topics",
    time: "4:00 PM",
    location: "Multiple Rooms",
    attendees: 120,
    highlights: ["Peer learning", "Industry networking", "Action planning"]
  }
];

export default function GalleryTab({ eventId }: GalleryTabProps) {
  const [selectedMedia, setSelectedMedia] = useState<EventGalleryItem | null>(null);

  const { data, status } = useQuery({
    queryKey: ["event-gallery", eventId],
    queryFn: () => kyInstance.get(`/api/events/${eventId}/gallery`).json<GalleryResponse>(),
  });

  const galleryItems = data?.galleryItems || [];

  const handleShare = async (item: EventGalleryItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Event Gallery Item",
          text: item.caption || "Check out this photo from the event!",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Event Gallery
        </h3>
        <Button size="sm" variant="outline">
          <Camera className="w-4 h-4 mr-2" />
          Add Photos
        </Button>
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photos">Photos & Videos</TabsTrigger>
          <TabsTrigger value="activities">Activity Highlights</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="mt-6">
          {status === "pending" ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : status === "error" ? (
            <div className="text-center py-12 text-destructive">
              Failed to load gallery items.
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {galleryItems.map((item) => (
                <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all duration-200">
                  <div className="aspect-square relative">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="w-full h-full cursor-pointer"
                          onClick={() => setSelectedMedia(item)}
                        >
                          {item.media.type === "IMAGE" ? (
                            <Image
                              src={item.media.url}
                              alt={item.caption || "Gallery Item"}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <video src={item.media.url} className="w-full h-full object-cover" />
                          )}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <div className="space-y-4">
                          <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
                            {selectedMedia?.media.type === "IMAGE" || item.media.type === "IMAGE" ? (
                              <Image
                                src={selectedMedia?.media.url || item.media.url}
                                alt={selectedMedia?.caption || item.caption || "Gallery Item"}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <video
                                src={selectedMedia?.media.url || item.media.url}
                                className="w-full h-full"
                                controls
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            {(selectedMedia?.caption || item.caption) && (
                              <p className="text-muted-foreground">
                                {selectedMedia?.caption || item.caption}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {selectedMedia ?
                                  new Date(selectedMedia.createdAt).toLocaleDateString() :
                                  new Date(item.createdAt).toLocaleDateString()
                                }
                              </span>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleShare(selectedMedia || item)}>
                                  <Share className="w-3 h-3 mr-1" />
                                  Share
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="absolute top-2 left-2">
                      <Badge variant={item.media.type === "VIDEO" ? "destructive" : "secondary"} className="text-xs">
                        {item.media.type === "VIDEO" ? (
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
                    <div className="absolute top-2 right-2 text-white/80 text-xs bg-black/50 rounded px-1 py-0.5">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    {item.caption ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.caption}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No caption</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Media Yet</h4>
              <p className="text-muted-foreground">
                Photos and videos from the event will appear here once they're uploaded.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Key moments and highlights from the event activities.
            </p>

            <div className="space-y-4">
              {activityHighlights.map((activity, index) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.time}
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">
                          {activity.location}
                        </span>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span>👥 {activity.attendees} attendees</span>
                        <span>🏆 {activity.highlights.length} key highlights</span>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold uppercase tracking-wide">Highlights:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {activity.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-primary rounded-full" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-primary opacity-20 ml-4">
                      {index + 1}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center py-6 border-t">
              <h4 className="font-semibold mb-2">Share Your Experience</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Contribute photos, videos, or activity highlights to help preserve event memories.
              </p>
              <Button variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Contribute to Gallery
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
