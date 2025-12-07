"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment({
  postId,
  content,
  postType = "post",
}: {
  postId: string;
  content: string;
  postType?: "post" | "organization";
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content: contentValidated } = createCommentSchema.parse({ content });

  if (postType === "organization") {
    // For organization posts, we don't create notifications for now
    // as the notification system is linked to the 'Post' model, not 'OrganizationPost'
    
    // Check if post exists
    const post = await prisma.organizationPost.findUnique({
      where: { id: postId },
    });

    if (!post) throw new Error("Post not found");

    const newComment = await prisma.comment.create({
      data: {
        content: contentValidated,
        orgPostId: postId,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    });
    return JSON.parse(JSON.stringify(newComment));
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      userId: true,
    },
  });

  if (!post) throw new Error("Post not found");

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: postId,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    }),
    ...(post.userId !== user.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.id,
              recipientId: post.userId,
              postId: postId,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  return JSON.parse(JSON.stringify(newComment));
}

export async function deleteComment(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== user.id) throw new Error("Unauthorized");

  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id),
  });

  return deletedComment;
}
