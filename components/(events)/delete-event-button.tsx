"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteEvent } from "@/lib/actions/event";
import { useSession } from "next-auth/react";

interface DeleteEventButtonProps {
  eventId: string;
  eventName: string;
}

export function DeleteEventButton({
  eventId,
  eventName,
}: DeleteEventButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteType, setDeleteType] = React.useState<"soft" | "hard">("soft");

  const handleDelete = async () => {
    if (!session?.user?.id) return;

    try {
      setIsDeleting(true);
      const result = await deleteEvent(eventId, session.user.id, deleteType);

      if (result?.success) {
        toast({
          title: "Success",
          description: result.message || "Event deleted successfully",
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result?.error || "Failed to delete event",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Event
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the event "{eventName}". This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Button
            variant={deleteType === "soft" ? "default" : "outline"}
            size="sm"
            onClick={() => setDeleteType("soft")}
          >
            Cancel Event
          </Button>
          <Button
            variant={deleteType === "hard" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setDeleteType("hard")}
          >
            Delete Permanently
          </Button>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className={deleteType === "hard" ? "bg-destructive" : undefined}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Deleting...
              </>
            ) : deleteType === "hard" ? (
              "Delete Permanently"
            ) : (
              "Cancel Event"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
