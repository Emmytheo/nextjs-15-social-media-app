import { OrganizationWithCounts } from "../page";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookIcon,
  CalendarIcon,
  HeartIcon,
  Plus,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventWithDetails } from "@/app/(main)/events/[event-id]/page";

interface OrganizationEventsTabProps {
  organization: OrganizationWithCounts;
  isAdmin?: boolean;
}

export function OrganizationEventsTab({
  organization,
  isAdmin,
}: OrganizationEventsTabProps) {
  const quickStats = [
    {
      label: "Active Members",
      value: organization._count.members.toString(),
      icon: UsersIcon,
    },
    {
      label: "Posts Created",
      value: organization._count.posts.toString(),
      icon: BookIcon,
    },
    { label: "Events Hosted", value: organization.events?.length.toString() || "0", icon: CalendarIcon },
    { label: "Partnerships", value: "12", icon: HeartIcon },
  ];

  // ... (highlightedEvents mock data removed or kept if needed, but I'll keep it to minimize diff)
  const highlightedEvents = [
    {
      id: "1",
      title: "Annual Charity Run 2024",
      image: "/img/icon.png",
      date: "2024-10-05",
      status: "Upcoming",
      participants: 150,
      goal: 200,
    },
    {
      id: "2",
      title: "Leadership Summit",
      image: "/img/logo.png",
      date: "2024-09-30",
      status: "Full",
      participants: 80,
      goal: 80,
    },
    {
      id: "3",
      title: "Community Garden Tour",
      image: "/img/icon.png",
      date: "2024-10-12",
      status: "Registering",
      participants: 45,
      goal: 50,
    },
  ];

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Events</h3>
        {isAdmin && (
          <Link href={`/events/create/${organization.id}`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-4 text-center">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="hot-events" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hot-events" className="flex gap-2">
              <CalendarIcon className="h-4 w-4" />
              Hot Events
            </TabsTrigger>
            <TabsTrigger value="all-events" className="flex gap-2">
              <CalendarIcon className="h-4 w-4" />
              All Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hot-events" className="mt-6">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Check out Hot Events Organized by {organization.name}
              </p>

              {organization.events && organization.events.map((event: EventWithDetails) => (
                <Card key={event.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={event.logoUrl || "/img/icon.png"}
                        alt={event.title}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="truncate text-sm font-semibold leading-tight">
                        {event.title}
                      </h5>
                      <p className="mb-2 text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            event.status === "Full"
                              ? "secondary"
                              : event.status === "Upcoming"
                                ? "default"
                                : "outline"
                          }
                          className="text-xs capitalize"
                        >
                          {event.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          👥 {event.attendees ? event.attendees.length : 0}/{0}
                        </span>
                      </div>
                      {/* <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
                                      <div
                                        className="h-1.5 rounded-full bg-primary"
                                        style={{
                                          width: `${(event.participants / event.goal) * 100}%`,
                                        }}
                                      />
                                    </div> */}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="highlights" className="mt-6"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
