"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ClipboardEvent, useRef, useState } from "react";
import useMediaUpload, { Attachment } from "@/components/posts/editor/useMediaUpload";
import { useDropzone } from "@uploadthing/react";
import { Button } from "@/components/ui/button";
import { Image as LucideImage, Loader2, X } from "lucide-react";
import Image from "next/image";
import "../../../../components/posts/editor/styles.css";
import { useSubmitOrganizationPostMutation } from "./mutations";


interface OrganizationPostEditorProps {
  organizationId: string;
}

export default function OrganizationPostEditor({ organizationId }: OrganizationPostEditorProps) {
  const { user } = useSession();


  const { toast } = useToast();

  const mutation = useSubmitOrganizationPostMutation(organizationId);

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { onClick, ...rootProps } = getRootProps();


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

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  }


  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUploads();
        },
      },
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex gap-4 items-start">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline mt-1 flex-shrink-0" />
        <div {...rootProps} className="w-full min-w-0">
          <EditorContent
            editor={editor}
            className={cn(
              "min-h-[5.5rem] max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background/80 border border-border/70 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 transition-all px-4 py-3 text-[15px] leading-relaxed",
              isDragActive && "outline-dashed border-primary",
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}
      <div className="flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-2">
          <AddAttachmentsButton
            onFilesSelected={startUpload}
            disabled={isUploading || attachments.length >= 5}
          />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Attach photo or video
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isUploading && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span>{uploadProgress ?? 0}%</span>
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
          )}
          <LoadingButton
            onClick={onSubmit}
            loading={mutation.isPending}
            disabled={!input.trim() || isUploading}
            className="rounded-xl px-5 font-bold shadow-sm"
          >
            Post
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}


interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <LucideImage size={20} />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, mediaId, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);

  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
          type="button"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}

