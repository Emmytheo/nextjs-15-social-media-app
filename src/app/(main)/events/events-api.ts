import ky from "@/lib/ky";
import { ReactNode } from "react";

export interface EventWithOrg {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  startDate: string | Date;
  endDate: string | Date | null;
  location: string | null;
  venue: string | null;
  address: string | null;
  coverPhotoUrl: string | null;
  logoUrl: string | null;
  ticketType: string | null;
  ticketPrice: number | null;
  ticketUrl: string | null;
  programmeOverview: string | null;
  status: string;
  isPublished: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
  };
  attendees?: Array<{
    id: string;
    userId: string;
    status: string;
    user?: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
    };
  }>;
}

export interface GetEventsParams {
  organizationId?: string | null;
  scope?: "all" | "my-guilds" | "attending" | "hosted" | string | null;
  timeframe?: "all" | "upcoming" | "this-week" | "this-month" | "past" | string | null;
  ticketType?: "ALL" | "FREE" | "PAID" | string | null;
  category?: string | null;
  search?: string | null;
}

export async function getEvents(params: GetEventsParams = {}): Promise<EventWithOrg[]> {
  const searchParams: Record<string, string> = {};

  if (params.organizationId) searchParams.organizationId = params.organizationId;
  if (params.scope && params.scope !== "all") searchParams.scope = params.scope;
  if (params.timeframe && params.timeframe !== "all") searchParams.timeframe = params.timeframe;
  if (params.ticketType && params.ticketType !== "ALL") searchParams.ticketType = params.ticketType;
  if (params.category && params.category !== "ALL") searchParams.category = params.category;
  if (params.search && params.search.trim()) searchParams.search = params.search.trim();

  return ky
    .get("/api/events", {
      searchParams,
    })
    .json();
}
