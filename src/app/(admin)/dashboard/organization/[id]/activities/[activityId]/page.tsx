import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ArrowLeft, Edit, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { formatDate } from "date-fns";

interface PageProps {
    params: Promise<{ id: string; activityId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { user } = await validateRequest();
    if (!user) redirect("/login");

    const { id, activityId } = await params;

    const activity = await prisma.organizationActivity.findUnique({
        where: { id: activityId },
        include: {
            user: { select: { displayName: true } },
            organizationProgram: { select: { id: true, title: true } },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            displayName: true,
                            username: true,
                            avatarUrl: true,
                        },
                    },
                },
                take: 10, // Limit for preview
            },
            gallery: {
                take: 6,
                orderBy: { createdAt: "desc" },
            },
            highlights: {
                take: 3,
                orderBy: { createdAt: "desc" },
            },
            _count: {
                select: {
                    participants: true,
                    gallery: true,
                    highlights: true,
                },
            },
        },
    });

    if (!activity) redirect(`/dashboard/organization/${id}?tab=activities`);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/organization/${id}?tab=activities`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">{activity.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">
                            {activity.type}
                        </Badge>
                        {activity.organizationProgram && (
                            <>
                                <span>•</span>
                                <Link href={`/dashboard/organization/${id}/programs/${activity.organizationProgram.id}`} className="hover:underline">
                                    Part of: {activity.organizationProgram.title}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Activity
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {activity.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Start:</span>
                                        <span>{formatDate(activity.startDate, "MMM d, yyyy h:mm a")}</span>
                                    </div>
                                    {activity.endDate && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">End:</span>
                                            <span>{formatDate(activity.endDate, "MMM d, yyyy h:mm a")}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {activity.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Location:</span>
                                            <span>{activity.location}</span>
                                        </div>
                                    )}
                                    {activity.capacity && (
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Capacity:</span>
                                            <span>{activity.capacity} people</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="participants">
                        <TabsList>
                            <TabsTrigger value="participants">Participants ({activity._count.participants})</TabsTrigger>
                            <TabsTrigger value="gallery">Gallery ({activity._count.gallery})</TabsTrigger>
                            <TabsTrigger value="highlights">Highlights ({activity._count.highlights})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="participants" className="space-y-4">
                            {activity.participants.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No participants yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {activity.participants.map((p) => (
                                        <div key={p.id} className="flex items-center gap-2 p-2 border rounded-md">
                                            {/* Avatar would go here */}
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{p.user.displayName}</span>
                                                <span className="text-xs text-muted-foreground">@{p.user.username}</span>
                                            </div>
                                            <Badge variant="secondary" className="ml-auto text-xs">{p.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="gallery">
                            {activity.gallery.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No gallery items linked to this activity.
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {activity.gallery.map((item) => (
                                        <div key={item.id} className="aspect-square bg-muted rounded-md overflow-hidden relative">
                                            {/* Placeholder for image - in real app use Next/Image */}
                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                                                {item.type}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="highlights">
                            {activity.highlights.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No highlights linked to this activity.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {activity.highlights.map((highlight) => (
                                        <Card key={highlight.id}>
                                            <CardHeader className="py-3">
                                                <CardTitle className="text-base">{highlight.title}</CardTitle>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-4">
                    {/* Sidebar Stats or Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Activity Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Created By</span>
                                <span className="font-medium">{activity.user.displayName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Created At</span>
                                <span className="font-medium">{formatDate(activity.createdAt, "MMM d, yyyy")}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
