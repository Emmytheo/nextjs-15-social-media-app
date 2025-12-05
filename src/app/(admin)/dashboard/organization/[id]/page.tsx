import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Star, BookOpen } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { user } = await validateRequest();
    if (!user) redirect("/login");

    const { id } = await params;

    const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    members: true,
                    events: true,
                    highlights: true,
                    programs: true,
                },
            },
        },
    });

    if (!organization) redirect("/");

    const stats = [
        {
            title: "Total Members",
            value: organization._count.members,
            icon: Users,
        },
        {
            title: "Active Programs",
            value: organization._count.programs,
            icon: BookOpen,
        },
        {
            title: "Upcoming Events",
            value: organization._count.events, // This is total events, ideally filter for upcoming
            icon: Calendar,
        },
        {
            title: "Highlights",
            value: organization._count.highlights,
            icon: Star,
        },
    ];

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Add Charts or Recent Activity here later */}
        </div>
    );
}
