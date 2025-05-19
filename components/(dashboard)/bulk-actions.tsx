"use client";

import * as React from "react";
import { Trash2, Archive, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { deleteEvent } from "@/lib/actions/event";
import type { Event } from "@/types/event";

type BulkAction = "cancel" | "delete" | "publish";

interface BulkActionsProps {
  selectedEvents: Event[];
  onActionComplete: () => void;
  disabled?: boolean;
}

export function BulkActions({
  selectedEvents,
  onActionComplete,
  disabled = false,
}: BulkActionsProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<BulkAction | null>(
    null
  );
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleBulkAction = async () => {
    if (!session?.user?.id || !confirmAction) return;

    setIsProcessing(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Process each event
      for (const event of selectedEvents) {
        try {
          if (confirmAction === "delete") {
            await deleteEvent(event.id, session.user.id, "hard");
          } else if (confirmAction === "cancel") {
            await deleteEvent(event.id, session.user.id, "soft");
          }
          // Note: 'publish' action would need a new server action to implement

          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error processing event ${event.id}:`, error);
        }
      }

      // Show results toast
      toast({
        title: "Bulk Action Complete",
        description: `${successCount} events processed successfully${
          errorCount > 0 ? `, ${errorCount} failed` : ""
        }`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

      // Close dialog and notify parent
      setOpenDialog(false);
      onActionComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = selectedEvents.length;
  const isDisabled = disabled || selectedCount === 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isDisabled}
            className="min-w-[120px]"
          >
            Bulk Actions
            {selectedCount > 0 && ` (${selectedCount})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setConfirmAction("cancel");
              setOpenDialog(true);
            }}
            className="text-orange-500 focus:text-orange-500"
          >
            <Archive className="mr-2 h-4 w-4" />
            Cancel Events
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setConfirmAction("delete");
              setOpenDialog(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Events
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "delete"
                ? "Delete"
                : confirmAction === "cancel"
                ? "Cancel"
                : "Process"}{" "}
              Selected Events?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "delete" ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive inline-block mr-2" />
                  This action will permanently delete {selectedCount} selected
                  events. This cannot be undone.
                </>
              ) : confirmAction === "cancel" ? (
                <>
                  This will cancel {selectedCount} selected events. Attendees
                  will be notified and registrations will be disabled.
                </>
              ) : (
                "Are you sure you want to process the selected events?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={
                confirmAction === "delete"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
