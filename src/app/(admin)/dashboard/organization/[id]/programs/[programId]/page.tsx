import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { formatDate } from "date-fns";

interface PageProps {
    params: Promise<{ id: string; programId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { user } = await validateRequest();
    if (!user) redirect("/login");

    const { id, programId } = await params;

    const program = await prisma.organizationProgram.findUnique({
        where: { id: programId },
        include: {
            user: { select: { displayName: true } },
            activities: {
                orderBy: { startDate: "asc" },
            },
            events: {
                orderBy: { startDate: "asc" },
            },
            gallery: {
                take: 6,
                orderBy: { createdAt: "desc" },
            },
            _count: {
                select: {
                    activities: true,
                    events: true,
                    gallery: true,
                },
            },
        },
    });

    if (!program) redirect(`/dashboard/organization/${id}/programs`);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/organization/${id}/programs`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">{program.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant={program.status === "ACTIVE" ? "default" : "secondary"}>
                            {program.status}
                        </Badge>
                        <span>•</span>
                        <span>{program.category}</span>
                    </div>
                </div>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Program
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>About</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {program.description || "No description provided."}
                            </p>
                            <div className="mt-4 flex gap-4 text-sm">
                                {program.startDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Start: {formatDate(program.startDate, "MMM d, yyyy")}</span>
                                    </div>
                                )}
                                {program.endDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>End: {formatDate(program.endDate, "MMM d, yyyy")}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="activities">
                        <TabsList>
                            <TabsTrigger value="activities">Activities ({program._count.activities})</TabsTrigger>
                            <TabsTrigger value="events">Events ({program._count.events})</TabsTrigger>
                            <TabsTrigger value="gallery">Gallery ({program._count.gallery})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="activities" className="space-y-4">
                            {program.activities.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No activities linked to this program.
                                </div>
                            ) : (
                                program.activities.map((activity) => (
                                    <Card key={activity.id}>
                                        <CardHeader className="py-3">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-base">{activity.title}</CardTitle>
                                                <Badge variant="outline">{activity.type}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="py-3 pt-0 text-sm text-muted-foreground">
                                            {formatDate(activity.startDate, "MMM d, yyyy")}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                        <TabsContent value="events">
                            {program.events.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No events linked to this program.
                                </div>
                            ) : (
                                program.events.map((event) => (
                                    <Card key={event.id}>
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-base">{event.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-3 pt-0 text-sm text-muted-foreground">
                                            {formatDate(event.startDate, "MMM d, yyyy")}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                        <TabsContent value="gallery">
                            {program.gallery.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No gallery items linked to this program.
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {program.gallery.map((item) => (
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
                    </Tabs>
                </div>

                <div className="space-y-4">
                    {/* Sidebar Stats or Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Program Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Created By</span>
                                <span className="font-medium">{program.user.displayName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Created At</span>
                                <span className="font-medium">{formatDate(program.createdAt, "MMM d, yyyy")}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
