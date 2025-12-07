import ky from "@/lib/ky";
import { ReactNode } from "react";

export interface EventWithOrg {
  image: any;
  date: string | number | Date;
  participants: ReactNode;
  goal: ReactNode;
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  startDate: Date;
  endDate: Date | null;
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
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  organization: {
    id: string;
    name: string;
  };
  attendees?: any
}

export interface GetEventsParams {
  organizationId?: string | null;
}

export async function getEvents({ organizationId }: GetEventsParams): Promise<EventWithOrg[]> {
  return ky
    .get("/api/events", {
      ...(organizationId && {
        searchParams: { organizationId },
      }),
    })
    .json();
}
