import { Building2, Users, Calendar, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlatformStatCardsProps {
  orgCount: number;
  userCount: number;
  eventCount: number;
  postCount: number;
}

const cards = [
  {
    key: "orgs" as const,
    description: "Active Communities",
    icon: Building2,
    href: "/organization",
    footerLabel: "View all communities",
    badgeVariant: "outline" as const,
    gradient: "from-violet-600/10 to-violet-600/5",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100 dark:bg-violet-950",
  },
  {
    key: "users" as const,
    description: "Registered Citizens",
    icon: Users,
    href: "/",
    footerLabel: "View social feed",
    badgeVariant: "outline" as const,
    gradient: "from-blue-600/10 to-blue-600/5",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-950",
  },
  {
    key: "events" as const,
    description: "Events Hosted",
    icon: Calendar,
    href: "/events",
    footerLabel: "Browse events",
    badgeVariant: "outline" as const,
    gradient: "from-emerald-600/10 to-emerald-600/5",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
  },
  {
    key: "posts" as const,
    description: "Posts & Discussions",
    icon: MessageSquare,
    href: "/",
    footerLabel: "View community feed",
    badgeVariant: "outline" as const,
    gradient: "from-orange-600/10 to-orange-600/5",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100 dark:bg-orange-950",
  },
];

export function PlatformStatCards({
  orgCount,
  userCount,
  eventCount,
  postCount,
}: PlatformStatCardsProps) {
  const values: Record<string, number> = {
    orgs: orgCount,
    users: userCount,
    events: eventCount,
    posts: postCount,
  };

  return (
    <div className="*:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = values[card.key];
        return (
          <Link href={card.href} key={card.key} className="group">
            <Card
              className={`@container/card h-full transition-all hover:shadow-md hover:border-primary/30 bg-gradient-to-br ${card.gradient}`}
            >
              <CardHeader className="relative pb-2">
                <div className="flex items-start justify-between">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                    <Icon className={`size-5 ${card.iconColor}`} />
                  </div>
                  <Badge variant={card.badgeVariant} className="flex gap-1 rounded-lg text-xs">
                    <TrendingUp className="size-3" />
                    Live
                  </Badge>
                </div>
                <CardTitle className="@[250px]/card:text-4xl text-3xl font-bold tabular-nums mt-2 group-hover:text-primary transition-colors">
                  {value.toLocaleString()}
                </CardTitle>
                <CardDescription className="font-medium">{card.description}</CardDescription>
              </CardHeader>
              <CardFooter className="text-xs text-muted-foreground group-hover:text-primary transition-colors pt-0">
                {card.footerLabel} →
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
