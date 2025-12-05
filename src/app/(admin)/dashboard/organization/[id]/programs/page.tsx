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
import { MoreHorizontal, Plus, Folder } from "lucide-react";
import { formatDate } from "date-fns";
import Link from "next/link";
import { CreateOrganizationProgramForm } from "@/app/(main)/organization/[org-name-id]/CreateOrganizationProgramForm";

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

    const programs = await prisma.organizationProgram.findMany({
        where: { organizationId: id },
        include: {
            user: {
                select: { displayName: true },
            },
            _count: {
                select: {
                    events: true,
                    activities: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Folder className="h-6 w-6 text-muted-foreground" />
                    <h2 className="text-2xl font-bold tracking-tight">Programs</h2>
                </div>
                <CreateOrganizationProgramForm organizationId={id} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stats</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {programs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No programs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            programs.map((program) => (
                                <TableRow key={program.id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={`/dashboard/organization/${id}/programs/${program.id}`}
                                            className="hover:underline"
                                        >
                                            {program.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={program.status === "ACTIVE" ? "default" : "secondary"}>
                                            {program.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{program.category || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs text-muted-foreground">
                                            <span>{program._count.activities} Activities</span>
                                            <span>{program._count.events} Events</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{program.user.displayName}</TableCell>
                                    <TableCell>{formatDate(program.createdAt, "MMM d, yyyy")}</TableCell>
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
                                                    <Link href={`/dashboard/organization/${id}/programs/${program.id}`}>
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Edit Program</DropdownMenuItem>
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
