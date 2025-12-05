import { OrganizationWithCounts } from "../page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  StarIcon,
  HeartIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  BookIcon,
  AwardIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SelectionsTabProps {
  organization: OrganizationWithCounts;
}

// Mock data - in a real app, this would come from an API
const featuredPosts = [
  {
    id: "1",
    title: "How We Built a Sustainable Community Garden",
    excerpt:
      "Learn about our journey in transforming urban spaces into thriving green hubs...",
    author: "Dr. Sarah Green",
    authorAvatar: "/img/icon.png",
    readTime: "5 min read",
    likes: 234,
    date: "2024-09-22",
    category: "Success Stories",
    featured: true,
  },
  {
    id: "2",
    title: "Youth Leadership Program: Year 1 Highlights",
    excerpt:
      "Celebrating the achievements of our first cohort of emerging leaders...",
    author: "Mike Johnson",
    authorAvatar: "/img/logo.png",
    readTime: "8 min read",
    likes: 187,
    date: "2024-09-15",
    category: "Impact Report",
    featured: false,
  },
  {
    id: "3",
    title: "Partner Spotlight: TechCorp Foundation",
    excerpt: "How collaboration drives innovation in community development...",
    author: "Lisa Chen",
    authorAvatar: "/img/icon.png",
    readTime: "6 min read",
    likes: 156,
    date: "2024-09-08",
    category: "Partnerships",
    featured: false,
  },
];

const topContributors = [
  {
    id: "1",
    name: "Dr. Sarah Green",
    avatar: "/img/icon.png",
    role: "Executive Director",
    contributions: 45,
    badge: "💎 Organization Superstar",
  },
  {
    id: "2",
    name: "Mike Johnson",
    avatar: "/img/logo.png",
    role: "Program Coordinator",
    contributions: 32,
    badge: "🌟 Community Champion",
  },
  {
    id: "3",
    name: "Lisa Chen",
    avatar: "/img/icon.png",
    role: "Partnership Manager",
    contributions: 28,
    badge: "🤝 Connection Builder",
  },
  {
    id: "4",
    name: "David Wilson",
    avatar: "/img/logo.png",
    role: "Youth Mentor",
    contributions: 24,
    badge: "🎯 Impact Maker",
  },
];

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

const quickStats = [
  // { label: "Active Members", value: organization._count.members.toString(), icon: UsersIcon },
  // { label: "Posts Created", value: organization._count.posts.toString(), icon: BookIcon },
  { label: "Events Hosted", value: "24", icon: CalendarIcon },
  { label: "Partnerships", value: "12", icon: HeartIcon },
];

export function EventsTab({ organization }: SelectionsTabProps) {
  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <StarIcon className="h-5 w-5" />
          Featured Content & Highlights
        </h3>
        <Button size="sm" variant="outline">
          <TrendingUpIcon className="mr-2 h-4 w-4" />
          View All
        </Button>
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

        {/* Top Contributors & Highlighted Events */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
          {/* Top Contributors */}
          <div>
            <h4 className="text-md mb-4 flex items-center gap-2 font-semibold">
              <AwardIcon className="h-4 w-4" />
              Star Contributors
            </h4>
            <div className="space-y-3">
              {topContributors.map((contributor, index) => (
                <Card key={contributor.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contributor.avatar} />
                      <AvatarFallback>
                        {contributor.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {contributor.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contributor.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {contributor.contributions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        contribs
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {contributor.badge}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Highlighted Events */}
          <div>
            <h4 className="text-md mb-4 flex items-center gap-2 font-semibold">
              <CalendarIcon className="h-4 w-4" />
              Hot Events
            </h4>
            <div className="space-y-3">
              {highlightedEvents.map((event) => (
                <Card key={event.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={event.image}
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
                        {new Date(event.date).toLocaleDateString()}
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
                          className="text-xs"
                        >
                          {event.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          👥 {event.participants}/{event.goal}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{
                            width: `${(event.participants / event.goal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 text-center dark:from-yellow-950/30 dark:to-orange-950/30">
          <StarIcon className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
          <h4 className="mb-2 text-lg font-semibold">Want to Be Featured?</h4>
          <p className="mb-4 text-muted-foreground">
            Share your stories, achievements, and contributions to inspire the{" "}
            {organization.name} community.
          </p>
          <Button variant="outline">Share Your Story</Button>
        </Card>
      </div>
    </div>
  );
}
