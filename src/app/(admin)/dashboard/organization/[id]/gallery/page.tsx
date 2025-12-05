import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Image as LucideImage, Video, Trash2 } from "lucide-react";
import { formatDate } from "date-fns";
import Link from "next/link";
import { CreateGalleryItemForm } from "@/app/(main)/organization/[org-name-id]/CreateGalleryItemForm";
import Image from "next/image";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { user } = await validateRequest();
    if (!user) redirect("/login");

    const { id } = await params;

    const organization = await prisma.organization.findUnique({
        where: { id },
        select: { id: true, name: true },
    });

    if (!organization) redirect("/");

    const galleryItems = await prisma.organizationGallery.findMany({
        where: { organizationId: id },
        include: {
            user: {
                select: { displayName: true },
            },
            activity: {
                select: { title: true, id: true },
            },
            program: {
                select: { title: true, id: true },
            },
            highlight: {
                select: { title: true, id: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LucideImage className="h-6 w-6 text-muted-foreground" />
                    <h2 className="text-2xl font-bold tracking-tight">Gallery</h2>
                </div>
                <CreateGalleryItemForm organizationId={id} />
            </div>

            {galleryItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border rounded-md border-dashed text-muted-foreground">
                    <LucideImage className="h-10 w-10 mb-2 opacity-20" />
                    <p>No media items found.</p>
                    <p className="text-sm">Upload photos or videos to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden group">
                            <div className="relative aspect-square bg-muted">
                                {item.type === "IMAGE" ? (
                                    <Image
                                        src={item.url}
                                        alt={item.title || "Gallery item"}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <video src={item.url} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="opacity-75">
                                        {item.type === "VIDEO" ? <Video className="h-3 w-3 mr-1" /> : <LucideImage className="h-3 w-3 mr-1" />}
                                        {item.type}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-3 space-y-2">
                                <div>
                                    <h3 className="font-medium truncate text-sm" title={item.title || "Untitled"}>
                                        {item.title || <span className="text-muted-foreground italic">Untitled</span>}
                                    </h3>
                                    {item.caption && <p className="text-xs text-muted-foreground truncate">{item.caption}</p>}
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {item.program && (
                                        <Badge variant="outline" className="text-[10px] h-5 px-1 truncate max-w-full">
                                            Prog: {item.program.title}
                                        </Badge>
                                    )}
                                    {item.activity && (
                                        <Badge variant="outline" className="text-[10px] h-5 px-1 truncate max-w-full">
                                            Act: {item.activity.title}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                                    <span>{item.user.displayName}</span>
                                    <span>{formatDate(item.createdAt, "MMM d")}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
