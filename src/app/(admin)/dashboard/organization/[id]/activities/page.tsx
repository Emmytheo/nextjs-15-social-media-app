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
import { MoreHorizontal, CalendarIcon } from "lucide-react";
import { formatDate } from "date-fns";
import Link from "next/link";
import { CreateOrganizationActivityForm } from "@/app/(main)/organization/[org-name-id]/CreateOrganizationActivityForm";

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

    const activities = await prisma.organizationActivity.findMany({
        where: { organizationId: id },
        include: {
            user: {
                select: { displayName: true },
            },
            organizationProgram: {
                select: { title: true },
            },
            _count: {
                select: {
                    participants: true,
                },
            },
        },
        orderBy: { startDate: "desc" },
    });

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                    <h2 className="text-2xl font-bold tracking-tight">Activities</h2>
                </div>
                <CreateOrganizationActivityForm organizationId={id} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No activities found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={`/dashboard/organization/${id}/activities/${activity.id}`}
                                            className="hover:underline"
                                        >
                                            {activity.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{activity.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{formatDate(activity.startDate, "MMM d, yyyy")}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(activity.startDate, "h:mm a")}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {activity.organizationProgram ? (
                                            <Link
                                                href={`/dashboard/organization/${id}/programs/${activity.organizationProgramId}`}
                                                className="hover:underline text-primary"
                                            >
                                                {activity.organizationProgram.title}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{activity._count.participants}</TableCell>
                                    <TableCell>{activity.user.displayName}</TableCell>
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
                                                    <Link href={`/dashboard/organization/${id}/activities/${activity.id}`}>
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Edit Activity</DropdownMenuItem>
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
