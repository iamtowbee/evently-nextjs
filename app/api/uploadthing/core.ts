import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  eventImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();

      if (!session) throw new Error("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { fileUrl: file.url, fileKey: file.key };
    }),
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      return { userId: "test" };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete for userId:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
