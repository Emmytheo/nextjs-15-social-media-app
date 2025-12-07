import { Prisma } from "@prisma/client";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        followers: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentInclude;
}

export function getNotificationDataSelect(loggedInUserId: string) {
  return {
    id: true,
    type: true,
    createdAt: true,
    read: true,
    issuerId: true,
    postId: true,
    issuer: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.NotificationSelect;
}


export function getOrganizationDataSelect() {
  return {
    id: true,
    name: true,
    description: true,
    logoUrl: true,
    bannerUrl: true,
    createdAt: true,
    _count: {
      select: {
        posts: true,
        members: true,
      },
    },
  } satisfies Prisma.OrganizationSelect;
}

export type OrganizationData = Prisma.OrganizationGetPayload<{
  select: ReturnType<typeof getOrganizationDataSelect>;
}>;

export interface OrganizationPost {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  organizationId: string;
}

export function getOrganizationPostInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    comments: {
      select: {
        id: true,
      },
      take: 1,
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.OrganizationPostInclude;
}

export type OrganizationPostData = Prisma.OrganizationPostGetPayload<{
  include: ReturnType<typeof getOrganizationPostInclude>;
}>;

export interface OrganizationPostsPage {
  posts: OrganizationPostData[];
  nextCursor: string | null;
}
export function getCommentDataSelect(loggedInUserId: string) {
  return {
    id: true,
    content: true,
    createdAt: true,
    userId: true,
    postId: true,
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentSelect;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  post: {
    select: {
      content: true,
    },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface NotificationCountInfo {
  unreadCount: number;
}

export interface MessageCountInfo {
  unreadCount: number;
}

export function getOrganizationHighlightInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
      },
    },
    activity: {
      select: {
        id: true,
        title: true,
      },
    },
    program: {
      select: {
        id: true,
        title: true,
      },
    },
  } satisfies Prisma.OrganizationHighlightInclude;
}

export type OrganizationHighlightData = Prisma.OrganizationHighlightGetPayload<{
  include: ReturnType<typeof getOrganizationHighlightInclude>;
}>;

export interface OrganizationHighlightsPage {
  highlights: OrganizationHighlightData[];
  nextCursor: string | null;
}

export function getOrganizationSelectionInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    songs: {
      include: {
        song: true,
      },
      orderBy: {
        order: "asc",
      },
    },
    _count: {
      select: {
        songs: true,
      },
    },
  } satisfies Prisma.OrganizationSelectionInclude;
}

export type OrganizationSelectionData = Prisma.OrganizationSelectionGetPayload<{
  include: ReturnType<typeof getOrganizationSelectionInclude>;
}>;

export interface OrganizationSelectionsPage {
  selections: OrganizationSelectionData[];
  nextCursor: string | null;
}

export function getOrganizationActivityInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    participants: {
      include: {
        user: {
          select: getUserDataSelect(loggedInUserId),
        }
      }
    },
    _count: {
      select: {
        participants: true,
      },
    },
  } satisfies Prisma.OrganizationActivityInclude;
}

export type OrganizationActivityData = Prisma.OrganizationActivityGetPayload<{
  include: ReturnType<typeof getOrganizationActivityInclude>;
}>;

export interface OrganizationActivitiesPage {
  activities: OrganizationActivityData[];
  nextCursor: string | null;
}

export function getOrganizationProgramInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    events: {
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
      }
    },
    activities: {
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
      }
    },
    _count: {
      select: {
        events: true,
        activities: true,
      },
    },
  } satisfies Prisma.OrganizationProgramInclude;
}

export type OrganizationProgramData = Prisma.OrganizationProgramGetPayload<{
  include: ReturnType<typeof getOrganizationProgramInclude>;
}>;

export interface OrganizationProgramsPage {
  programs: OrganizationProgramData[];
  nextCursor: string | null;
}

// EventActivity doesn't have user relation in schema, so we'll use a manual type
export interface EventActivityInclude {
  // EventActivity doesn't have includeable relations in current schema
}

export function getEventActivityInclude(loggedInUserId: string): EventActivityInclude {
  return {};
}

export interface EventActivitiesPage {
  activities: EventActivityData[];
  nextCursor: string | null;
}

export interface EventActivityData {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  location: string | null;
  eventId: string;
  category: string | null;
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}
