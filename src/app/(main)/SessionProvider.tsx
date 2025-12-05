"use client";

import { Session, User } from "lucia";
import React, { createContext, useContext } from "react";

interface SessionContext {
  user: User | null;
  session: Session | null;
  organization?: {
    id: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  // isAuthenticated: boolean;
  // isLoading: boolean;
  // login: (email: string, password: string) => Promise<void>;
  // logout: () => Promise<void>;
  // register: (
  //   email: string,
  //   password: string,
  //   username: string,
  // ) => Promise<void>;
  // updateProfile: (data: {
  //   name?: string;
  //   email?: string;
  //   avatarUrl?: string;
  // }) => Promise<void>;
  // followOrganization: (organizationId: string) => Promise<void>;
  // unfollowOrganization: (organizationId: string) => Promise<void>;
  // joinOrganization: (organizationId: string) => Promise<void>;
  // leaveOrganization: (organizationId: string) => Promise<void>;
  // getUserSessions: () => Promise<Session[]>;
  // validateSession: (
  //   sessionId: string,
  // ) => Promise<
  //   { user: User; session: Session } | { user: null; session: null }
  // >;
  // createSession: (
  //   userId: string,
  //   attributes?: Record<string, any>,
  //   options?: { sessionId?: string },
  // ) => Promise<Session>;
  // invalidateSession: (sessionId: string) => Promise<void>;
  // invalidateUserSessions: (userId: string) => Promise<void>;
  // deleteExpiredSessions: () => Promise<void>;
  // readSessionCookie: (cookieHeader: string) => string | null;
  // readBearerToken: (authorizationHeader: string) => string | null;
  // createSessionCookie: (sessionId: string) => string;
  // createBlankSessionCookie: () => string;
  // getUserDataSelect: (loggedInUserId: string) => Record<string, boolean>;
  // getOrganizationDataSelect: () => Record<string, boolean>;
  // getOrganizationPostInclude: (loggedInUserId: string) => Record<string, any>;
  // getCommentDataSelect: (loggedInUserId: string) => Record<string, any>;
  // getNotificationDataSelect: (loggedInUserId: string) => Record<string, any>;
  // getUserData: (userId: string) => Promise<User | null>;
  // getOrganizationData: (organizationId: string) => Promise<{
  //   id: string;
  //   name: string;
  //   description?: string | null;
  //   logoUrl?: string | null;
  //   bannerUrl?: string | null;
  //   createdAt: Date;
  //   updatedAt: Date;
  // } | null>;
  // getOrganizationPosts: (
  //   organizationId: string,
  //   cursor?: string,
  // ) => Promise<{
  //   posts: Array<{
  //     id: string;
  //     content: string;
  //     createdAt: Date;
  //     userId: string;
  //     organizationId: string;
  //     user: User;
  //   }>;
  //   nextCursor: string | null;
  // }>;
  // getComments: (
  //   postId: string,
  //   cursor?: string,
  // ) => Promise<{
  //   comments: Array<{
  //     id: string;
  //     content: string;
  //     createdAt: Date;
  //     userId: string;
  //     postId: string;
  //     user: User;
  //   }>;
  //   nextCursor: string | null;
  // }>;
  // getNotifications: (
  //   loggedInUserId: string,
  //   cursor?: string,
  // ) => Promise<{
  //   notifications: Array<{
  //     id: string;
  //     type: string;
  //     createdAt: Date;
  //     read: boolean;
  //     issuerId: string;
  //     postId?: string | null;
  //     issuer: User;
  //   }>;
  //   nextCursor: string | null;
  // }>;
  // getUserPosts: (
  //   userId: string,
  //   cursor?: string,
  // ) => Promise<{
  //   posts: Array<{
  //     id: string;
  //     content: string;
  //     createdAt: Date;
  //     userId: string;
  //     user: User;
  //   }>;
  //   nextCursor: string | null;
  // }>;
  // getUserFollowers: (
  //   userId: string,
  //   cursor?: string,
  // ) => Promise<{
  //   followers: User[];
  //   nextCursor: string | null;
  // }>;
  // getUserFollowing: (
  //   userId: string,
  //   cursor?: string,
  // ) => Promise<{
  //   following: User[];
  //   nextCursor: string | null;
  // }>;
  // getUserBookmarks: (
  //   userId: string,
  //   cursor?: string,
  // ) => Promise<{
  //   bookmarks: Array<{
  //     id: string;
  //     content: string;
  //     createdAt: Date;
  //     userId: string;
  //     user: User;
  //   }>;
  //   nextCursor: string | null;
  // }>;
  // getUserLikes: (
  //   userId: string,
  //   cursor?: string,
  // ) => Promise<{
  //   likes: Array<{
  //     id: string;
  //     content: string;
  //     createdAt: Date;
  //     userId: string;
  //     user: User;
  //   }>;
  //   nextCursor: string | null;
  // }>;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
