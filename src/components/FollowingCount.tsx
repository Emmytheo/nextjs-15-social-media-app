"use client";

import { formatNumber } from "@/lib/utils";
import { useState } from "react";
import UserListDialog from "./UserListDialog";

interface FollowingCountProps {
  userId: string;
  followingCount: number;
}

export default function FollowingCount({
  userId,
  followingCount,
}: FollowingCountProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDialog(true)}
        className="rounded-md transition-colors hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span>
          Following:{" "}
          <span className="font-semibold">{formatNumber(followingCount)}</span>
        </span>
      </button>
      <UserListDialog
        userId={userId}
        type="following"
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
