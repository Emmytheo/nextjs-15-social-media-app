import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Star } from "lucide-react";
import { formatDate } from "date-fns";
import Link from "next/link";
import { CreateOrganizationHighlightForm } from "@/app/(main)/organization/[org-name-id]/CreateOrganizationHighlightForm";

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

    const highlights = await prisma.organizationHighlight.findMany({
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
            _count: {
                select: {
                    likes: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-muted-foreground" />
                    <h2 className="text-2xl font-bold tracking-tight">Highlights</h2>
                </div>
                <CreateOrganizationHighlightForm organizationId={id} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Related To</TableHead>
                            <TableHead>Likes</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {highlights.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No highlights found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            highlights.map((highlight) => (
                                <TableRow key={highlight.id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={`/dashboard/organization/${id}/highlights/${highlight.id}`}
                                            className="hover:underline"
                                        >
                                            {highlight.title}
                                        </Link>
                                        {highlight.featured && (
                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                Featured
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{highlight.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            {highlight.program && (
                                                <Link
                                                    href={`/dashboard/organization/${id}/programs/${highlight.program.id}`}
                                                    className="hover:underline text-primary"
                                                >
                                                    Prog: {highlight.program.title}
                                                </Link>
                                            )}
                                            {highlight.activity && (
                                                <Link
                                                    href={`/dashboard/organization/${id}/activities/${highlight.activity.id}`}
                                                    className="hover:underline text-primary"
                                                >
                                                    Act: {highlight.activity.title}
                                                </Link>
                                            )}
                                            {!highlight.program && !highlight.activity && (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{highlight._count.likes}</TableCell>
                                    <TableCell>{highlight.user.displayName}</TableCell>
                                    <TableCell>{formatDate(highlight.createdAt, "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/organization/${id}/highlights/${highlight.id}`}>
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Edit Highlight</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
