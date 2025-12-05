"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Trophy,
  Target,
  Users,
  Clock,
  Zap,
  Calendar,
  Star,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateEventActivityForm } from "./CreateEventActivityForm";
import { format } from "date-fns";

interface ActivitiesGamesTabProps {
  eventId: string;
}

export interface EventActivityData {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  location: string | null;
  eventId: string;
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface EventActivitiesPage {
  activities: EventActivityData[];
  nextCursor: string | null;
}

// Mock data - in a real app, this would come from an API
const eventActivities = [
  {
    id: "1",
    title: "Panel Discussion: Future of AI",
    description:
      "Leading experts discuss emerging AI technologies and their impact on society",
    type: "Discussion",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    location: "Main Auditorium",
    participants: 120,
    maxParticipants: 150,
    speaker: "Dr. Sarah Chen",
    speakerAvatar: "/img/icon.png",
    highlights: ["AI Ethics", "Future Applications", "Industry Trends"],
  },
  {
    id: "2",
    title: "Workshop: Digital Strategy",
    description:
      "Hands-on workshop on developing effective digital transformation strategies",
    type: "Workshop",
    startTime: "2:00 PM",
    endTime: "5:00 PM",
    location: "Conference Room A",
    participants: 45,
    maxParticipants: 50,
    speaker: "Mike Johnson",
    speakerAvatar: "/img/logo.png",
    highlights: [
      "Strategy Frameworks",
      "Implementation Plans",
      "Success Metrics",
    ],
  },
  {
    id: "3",
    title: "Networking Reception",
    description:
      "Casual networking opportunity to connect with fellow attendees",
    type: "Networking",
    startTime: "6:30 PM",
    endTime: "8:00 PM",
    location: "Garden Terrace",
    participants: 200,
    maxParticipants: 250,
    speaker: "Conference Team",
    speakerAvatar: "/img/icon.png",
    highlights: ["Business Cards", "New Connections", "Industry Insights"],
  },
];

const gameChallenges = [
  {
    id: "1",
    title: "Trivia Challenge",
    description: "Test your knowledge about industry trends and innovations",
    difficulty: "Medium",
    duration: "15 minutes",
    points: 150,
    participants: 245,
    status: "Active",
    topScore: 145,
  },
  {
    id: "2",
    title: "Innovation Pitch Competition",
    description: "Pitch your startup ideas in 3 minutes to compete for prizes",
    difficulty: "Expert",
    duration: "1 hour",
    points: 500,
    participants: 12,
    status: "Upcoming",
    topScore: 0,
  },
  {
    id: "3",
    title: "Collaboration Quiz",
    description: "Team-based quiz covering conference topics",
    difficulty: "Easy",
    duration: "20 minutes",
    points: 100,
    participants: 89,
    status: "Completed",
    topScore: 98,
  },
];

const leaderboard = [
  {
    rank: 1,
    name: "Alice Chen",
    avatar: "/img/icon.png",
    points: 1450,
    badges: 8,
    change: "+120",
  },
  {
    rank: 2,
    name: "Bob Wilson",
    avatar: "/img/logo.png",
    points: 1320,
    badges: 7,
    change: "+85",
  },
  {
    rank: 3,
    name: "Carol Davis",
    avatar: "/img/icon.png",
    points: 1285,
    badges: 6,
    change: "+95",
  },
  {
    rank: 4,
    name: "David Park",
    avatar: "/img/logo.png",
    points: 1189,
    badges: 5,
    change: "+42",
  },
];

export default function ActivitiesGamesTab({
  eventId,
}: ActivitiesGamesTabProps) {
  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useQuery({
    queryKey: ["event-activities", eventId],
    queryFn: async () => {
      const response = await ky.get(`/api/events/${eventId}/activities`);
      return response.json<EventActivitiesPage>();
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 dark:text-green-400";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "Hard":
        return "text-red-600 dark:text-red-400";
      case "Expert":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Zap className="h-5 w-5" />
          Activities & Games
        </h3>
        <CreateEventActivityForm eventId={eventId} />
      </div>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-6">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Participate in various event activities and workshops to enhance
              your learning experience.
            </p>

            {activitiesLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 h-5 w-48 rounded bg-muted" />
                        <div className="h-4 w-32 rounded bg-muted" />
                      </div>
                      <div className="h-10 w-10 rounded-full bg-muted" />
                    </div>
                    <div className="mb-4 h-16 rounded bg-muted" />
                    <div className="flex gap-2">
                      <div className="h-8 flex-1 rounded bg-muted" />
                      <div className="h-8 flex-1 rounded bg-muted" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!activitiesLoading &&
              activitiesData?.activities &&
              activitiesData.activities.length === 0 && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-6 text-center">
                      <p className="text-muted-foreground">
                        No Activities Found
                      </p>
                    </Card>
                  ))}
                </div>
              )}

            {activitiesError && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  Failed to load activities
                </p>
              </Card>
            )}

            {activitiesData?.activities &&
              activitiesData.activities.length > 0 && (
                <div className="space-y-4">
                  {activitiesData.activities.map((activity, index) => (
                    <Card
                      key={activity.id}
                      className="p-4 transition-shadow hover:shadow-lg"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="item-start mb-2 flex w-fit flex-col gap-2 md:flex-row md:items-center">
                                <Badge
                                  variant="outline"
                                  className="w-fit text-xs"
                                >
                                  Workshop
                                </Badge>
                                <span className="whitespace-nowrap text-xs text-muted-foreground">
                                  🕒 {format(activity.startTime, "HH:mm")}
                                  {activity.endTime &&
                                    ` - ${format(activity.endTime, "HH:mm")}`}
                                </span>
                              </div>
                              <h4 className="mb-1 text-lg font-semibold">
                                {activity.title}
                              </h4>
                              <p className="mb-3 text-sm text-muted-foreground">
                                {activity.description ||
                                  "No description available"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {activity.user.displayName.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {activity.user.displayName}
                              </span>
                            </div>
                          </div>

                          {activity.location && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {activity.location}
                              </span>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button className="w-full" variant="default">
                              Register
                            </Button>
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

            {activitiesData?.activities.length === 0 && !activitiesLoading && (
              <Card className="p-8 text-center">
                <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  No activities yet
                </h3>
                <p className="mb-4 text-muted-foreground">
                  Activities and workshops will be scheduled soon. Check back
                  for the latest updates.
                </p>
                <CreateEventActivityForm eventId={eventId} />
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="games" className="mt-6">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Engage in fun and interactive games while networking with other
              attendees.
            </p>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {gameChallenges.map((game) => (
                <Card key={game.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex flex-col items-stretch overflow-x-hidden">
                      <div className="flex justify-between">
                        <h4 className="mb-1 overflow-x-hidden truncate font-semibold">
                          {game.title}
                        </h4>
                        <Badge className={getStatusColor(game.status)}>
                          {game.status}
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {game.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Difficulty
                        </p>
                        <p
                          className={`font-semibold ${getDifficultyColor(game.difficulty)}`}
                        >
                          {game.difficulty}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Duration
                        </p>
                        <p className="font-semibold">{game.duration}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Points
                        </p>
                        <p className="font-semibold">⭐ {game.points}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Participants
                        </p>
                        <p className="font-semibold">👥 {game.participants}</p>
                      </div>
                    </div>

                    {/* {game.topScore > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Highest Score</p>
                        <p className="font-semibold text-sm">🎯 {game.topScore} points</p>
                      </div>
                    )} */}

                    <div className="border-t pt-2">
                      <p className="mb-1 text-xs text-muted-foreground">
                        Highest Score
                      </p>
                      <p className="text-sm font-semibold">
                        🎯 {game.topScore ?? 0} points
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="w-full"
                      variant={
                        game.status === "Active"
                          ? "default"
                          : game.status === "Upcoming"
                            ? "outline"
                            : "secondary"
                      }
                      disabled={game.status === "Completed"}
                    >
                      {game.status === "Active"
                        ? "Play Now"
                        : game.status === "Upcoming"
                          ? "Coming Soon"
                          : "View Results"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t py-6 text-center">
              <Trophy className="mx-auto mb-3 h-10 w-10 text-yellow-500" />
              <h4 className="mb-2 font-semibold">Challenge Yourself!</h4>
              <p className="text-sm text-muted-foreground">
                Earn points, unlock achievements, and climb the leaderboard
                while learning.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              See how you rank among fellow attendees in activities and games.
            </p>

            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <Card key={player.name} className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ${index === 0
                        ? "bg-yellow-100 text-yellow-800"
                        : index === 1
                          ? "bg-gray-100 text-gray-800"
                          : index === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {index + 1}
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h4 className="font-semibold">{player.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>🏆 {player.points} points</span>
                        <span>🥇 {player.badges} badges</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold ${player.change.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                          }`}
                      >
                        {player.change}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        vs last week
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t py-6 text-center">
              <h4 className="mb-2 font-semibold">Your Ranking</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                #27 • 685 points • 3 badges earned
              </p>
              <Button variant="outline">
                <Trophy className="mr-2 h-4 w-4" />
                View Full Leaderboard
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
