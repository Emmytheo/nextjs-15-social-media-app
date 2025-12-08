import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Calendar, User, Heart } from "lucide-react";
import Link from "next/link";
import { formatDate } from "date-fns";
import Image from "next/image";

interface PageProps {
    params: Promise<{ id: string; highlightId: string }>;
}

export default async function Page({ params }: PageProps) {
    const { user } = await validateRequest();
    if (!user) redirect("/login");

    const { id, highlightId } = await params;

    const highlight = await prisma.organizationHighlight.findUnique({
        where: { id: highlightId },
        include: {
            user: {
                select: {
                    displayName: true,
                    username: true,
                    avatarUrl: true,
                    id: true
                },
            },
            activity: {
                select: { id: true, title: true },
            },
            program: {
                select: { id: true, title: true },
            },
            attachments: true,
            _count: {
                select: {
                    likes: true,
                },
            },
        },
    });

    if (!highlight) redirect(`/dashboard/organization/${id}?tab=highlights`);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/organization/${id}?tab=highlights`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold tracking-tight">{highlight.title}</h2>
                        {highlight.featured && (
                            <Badge variant="secondary">Featured</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{highlight.type}</Badge>
                        {highlight.category && (
                            <Badge variant="outline">{highlight.category}</Badge>
                        )}
                        <span>•</span>
                        <span>{formatDate(highlight.createdAt, "MMM d, yyyy")}</span>
                    </div>
                </div>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {highlight.excerpt && (
                                <div className="p-4 bg-muted/50 rounded-md italic text-muted-foreground border-l-4 border-primary">
                                    {highlight.excerpt}
                                </div>
                            )}
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {highlight.content}
                            </div>

                            {highlight.attachments.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {highlight.attachments.map((media) => (
                                        <div key={media.id} className="relative aspect-video rounded-md overflow-hidden bg-muted">
                                            {media.type === "IMAGE" ? (
                                                <Image
                                                    src={media.url}
                                                    alt="Highlight attachment"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <video src={media.url} controls className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" /> Author
                                </span>
                                <span className="font-medium">{highlight.user.displayName}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Heart className="h-4 w-4" /> Likes
                                </span>
                                <span className="font-medium">{highlight._count.likes}</span>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <span className="text-sm font-medium">Related To</span>
                                {highlight.program ? (
                                    <Link
                                        href={`/dashboard/organization/${id}/programs/${highlight.program.id}`}
                                        className="flex items-center justify-between p-2 rounded-md border hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm">Program</span>
                                        <span className="text-sm font-medium truncate max-w-[150px]">{highlight.program.title}</span>
                                    </Link>
                                ) : (
                                    <div className="flex items-center justify-between p-2 rounded-md border border-dashed text-muted-foreground">
                                        <span className="text-sm">Program</span>
                                        <span className="text-sm">-</span>
                                    </div>
                                )}

                                {highlight.activity ? (
                                    <Link
                                        href={`/dashboard/organization/${id}/activities/${highlight.activity.id}`}
                                        className="flex items-center justify-between p-2 rounded-md border hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm">Activity</span>
                                        <span className="text-sm font-medium truncate max-w-[150px]">{highlight.activity.title}</span>
                                    </Link>
                                ) : (
                                    <div className="flex items-center justify-between p-2 rounded-md border border-dashed text-muted-foreground">
                                        <span className="text-sm">Activity</span>
                                        <span className="text-sm">-</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
