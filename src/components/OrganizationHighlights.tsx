"use client";

import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { OrganizationHighlightsPage } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, Loader2 } from "lucide-react";
import { formatDate } from "date-fns";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import Link from "next/link";

export default function OrganizationHighlights() {
    const { data, status } = useQuery({
        queryKey: ["organization-highlights-feed"],
        queryFn: () =>
            kyInstance.get("/api/posts/highlights").json<OrganizationHighlightsPage>(),
    });

    if (status === "pending") {
        return <div className="hidden" />; // Don't show loading state to avoid clutter
    }

    if (status === "error" || !data?.highlights.length) {
        return null;
    }

    return (
        <div className="space-y-3 rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <h2 className="text-lg font-semibold">Organization Highlights</h2>
            </div>

            <Splide
                options={{
                    perPage: 1,
                    gap: "1rem",
                    arrows: !true,
                    pagination: true,
                    drag: true,
                    mediaQuery: 'min',
                    breakpoints: {
                        640: {
                            perPage: data.highlights.length > 1 ? 2 : 1,
                        }
                    }
                }}
            >
                {data.highlights.map((highlight) => (
                    <SplideSlide key={highlight.id}>
                        <Link href={`/organization/${highlight.organizationId}/tabs/highlights`}>
                            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-muted">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="text-base leading-tight truncate">
                                                    {highlight.title}
                                                </CardTitle>
                                                {highlight.featured && (
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1">
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Avatar className="w-4 h-4">
                                                        <AvatarImage src={highlight.user.avatarUrl || undefined} />
                                                        <AvatarFallback className="text-[8px]">
                                                            {highlight.user.displayName.slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="truncate max-w-[100px]">{highlight.user.displayName}</span>
                                                </div>
                                                <span>•</span>
                                                <span>{formatDate(highlight.createdAt, "MMM d")}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-4 pt-0">
                                    {highlight.excerpt && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                            {highlight.excerpt}
                                        </p>
                                    )}
                                    {highlight.category && (
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {highlight.category}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    </SplideSlide>
                ))}
            </Splide>
        </div>
    );
}
