import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: "512KB", maxFileCount: 1 } })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.userId // Optional: Logic to delete old avatar could go here
      return { avatarUrl: file.url };
    }),
  organizationLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {}),
  organizationBanner: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {}),
  songAudio: f({ audio: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(() => {}),
  songSheet: f({ pdf: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(() => {}),
  songCover: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(() => {}),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      const appId = process.env.UPLOADTHING_APP_ID;
      const formattedUrl = appId 
        ? file.url.replace("/f/", `/a/${appId}/`) 
        : file.url;

      const media = await prisma.media.create({
        data: {
          url: formattedUrl,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
