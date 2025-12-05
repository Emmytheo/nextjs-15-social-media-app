"use client";
import PostEditor from "@/components/posts/editor/PostEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
// } from "@radix-ui/react-dialog";
// import { Dialog } from "radix-ui";
import { useState } from "react";

export default async function WelcomeHome(props: { user?: any }) {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (open: boolean) => {
    setOpen(false);
  };
  return (
    <PostEditor />
  );
}
