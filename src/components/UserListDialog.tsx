"use client";

import FollowButton from "@/components/FollowButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import kyInstance from "@/lib/ky";
import { UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";

interface UserListDialogProps {
  userId: string;
  type: "followers" | "following";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserListDialog({
  userId,
  type,
  open,
  onOpenChange,
}: UserListDialogProps) {
  const { user: loggedInUser } = useSession();

  const title = type === "followers" ? "Followers" : "Following";

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["user-connections", type, userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/${type}/list`).json<UserData[]>(),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="size-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          )}

          {isError && (
            <p className="py-6 text-center text-sm text-destructive">
              Failed to load {type}.
            </p>
          )}

          {!isLoading && !isError && users && users.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              <p className="font-medium">No {type} yet</p>
            </div>
          )}

          {!isLoading && !isError && users && users.length > 0 && (
            <div className="space-y-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3"
                >
                  <UserTooltip user={u}>
                    <Link
                      href={`/users/${u.username}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 overflow-hidden"
                    >
                      <UserAvatar
                        avatarUrl={u.avatarUrl}
                        className="flex-none"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-1 break-all font-semibold hover:underline">
                          {u.displayName}
                        </p>
                        <p className="line-clamp-1 break-all text-xs text-muted-foreground">
                          @{u.username}
                        </p>
                      </div>
                    </Link>
                  </UserTooltip>

                  {loggedInUser && u.id !== loggedInUser.id && (
                    <FollowButton
                      userId={u.id}
                      initialState={{
                        followers: u._count.followers,
                        isFollowedByUser: u.followers.some(
                          ({ followerId }) => followerId === loggedInUser.id,
                        ),
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
