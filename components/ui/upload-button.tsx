"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ImageIcon, Loader2, TrashIcon } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { useDropzone } from "react-dropzone";
import { generateClientDropzoneAccept } from "uploadthing/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface UploadButtonProps {
  onChange: (url?: string) => void;
  value?: string;
  className?: string;
}

export function UploadButton({
  onChange,
  value,
  className,
}: UploadButtonProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("eventImage", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res?.[0]) {
        setPreview(res[0].url);
        onChange(res[0].url);
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      console.error(error);
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      const file = acceptedFiles[0];
      if (file.size > 4 * 1024 * 1024) {
        alert("File size too large. Maximum size is 4MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Start upload
      startUpload([file]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]),
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 transition-colors hover:bg-accent/50",
          isDragActive && "border-primary bg-accent/50",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : preview ? (
          <div className="absolute inset-0 flex items-center justify-between p-2">
            <div className="relative h-full aspect-video">
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full rounded object-cover"
              />
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) onDrop([file]);
                        };
                        input.click();
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload new image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        onChange(undefined);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop image or click to upload
            </p>
          </div>
        )}
      </div>
      <p className="text-[0.8rem] text-muted-foreground">
        Max file size: 4MB. Supported formats: JPEG, PNG, WebP
      </p>
    </div>
  );
}
