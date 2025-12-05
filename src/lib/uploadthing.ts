import { ourFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers, generateComponents } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<typeof ourFileRouter>();

export const { UploadButton, UploadDropzone } =
  generateComponents<typeof ourFileRouter>();
