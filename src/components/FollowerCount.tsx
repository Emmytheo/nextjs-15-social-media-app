"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useState } from "react";
import UserListDialog from "./UserListDialog";

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowerCount({
  userId,
  initialState,
}: FollowerCountProps) {
  const { data } = useFollowerInfo(userId, initialState);
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDialog(true)}
        className="rounded-md transition-colors hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span>
          Followers:{" "}
          <span className="font-semibold">{formatNumber(data.followers)}</span>
        </span>
      </button>
      <UserListDialog
        userId={userId}
        type="followers"
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
