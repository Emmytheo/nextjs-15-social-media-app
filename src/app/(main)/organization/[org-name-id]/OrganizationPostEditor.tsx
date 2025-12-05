"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import ky from "@/lib/ky";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

interface OrganizationPostEditorProps {
  organizationId: string;
}

export default function OrganizationPostEditor({ organizationId }: OrganizationPostEditorProps) {
  const { user } = useSession();


  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Share an update with your organization...",
      }),
    ],
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  async function onSubmit() {
    setIsPending(true);

    try {
      await ky.post(`/api/organizations/${organizationId}/posts`, {
        json: { content: input },
      });

      editor?.commands.clearContent();

      await queryClient.invalidateQueries({
        queryKey: ["organization-feed", "organization-posts", organizationId],
      });

      toast({
        description: "Post created",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3",
            )}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <LoadingButton
          onClick={onSubmit}
          loading={isPending}
          disabled={!input.trim()}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}
