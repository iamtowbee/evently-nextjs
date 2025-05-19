"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { PlusCircle, Edit, Calendar, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { deleteEvent } from "@/lib/actions/event";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@/types/event";
import { DeleteEventButton } from "@/components/(events)/delete-event-button";
import { EventStats } from "./event-stats";
import { BulkActions } from "./bulk-actions";
import { Checkbox } from "@/components/ui/checkbox";

interface DashboardContentProps {
  initialEvents: Event[];
}

export function DashboardContent({ initialEvents }: DashboardContentProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedEvents, setSelectedEvents] = React.useState<Event[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filter events based on search term and status
  const filteredEvents = React.useMemo(() => {
    return initialEvents.filter((event) => {
      // Filter by search term
      const matchesSearch =
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description &&
          event.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && event.status !== "cancelled") ||
        (statusFilter === "draft" && event.status === "draft") ||
        (statusFilter === "published" && event.status === "published") ||
        (statusFilter === "cancelled" && event.status === "cancelled");

      return matchesSearch && matchesStatus;
    });
  }, [initialEvents, searchTerm, statusFilter]);

  // Handle selection of items
  const toggleEventSelection = (event: Event) => {
    setSelectedEvents((prev) => {
      const isSelected = prev.some((e) => e.id === event.id);
      if (isSelected) {
        return prev.filter((e) => e.id !== event.id);
      } else {
        return [...prev, event];
      }
    });
  };

  const toggleAllSelection = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents([...filteredEvents]);
    }
  };

  const handleBulkActionComplete = () => {
    setSelectedEvents([]);
    setIsRefreshing(true);
    // In a real app, you'd refetch data here
    setTimeout(() => {
      router.refresh();
      setIsRefreshing(false);
    }, 500);
  };

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center py-10">
        <p>Please sign in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Events</h2>
        <Button asChild>
          <Link href="/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <EventStats events={initialEvents} />

      <div className="flex gap-4 flex-col md:flex-row md:items-center">
        <div className="flex-1 relative">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            defaultValue="all"
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <BulkActions
            selectedEvents={selectedEvents}
            onActionComplete={handleBulkActionComplete}
            disabled={isRefreshing}
          />
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found</p>
              {initialEvents.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              )}
              {initialEvents.length === 0 && (
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link href="/events/create">Create your first event</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-4 p-4 font-medium">
                <div className="flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={
                      filteredEvents.length > 0 &&
                      selectedEvents.length === filteredEvents.length
                    }
                    onCheckedChange={toggleAllSelection}
                    disabled={isRefreshing}
                  />
                </div>
                <div>Event</div>
                <div>Date</div>
                <div>Attendees</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-4 p-4"
                  >
                    <div>
                      <Checkbox
                        checked={selectedEvents.some((e) => e.id === event.id)}
                        onCheckedChange={() => toggleEventSelection(event)}
                        disabled={isRefreshing}
                      />
                    </div>
                    <div>
                      <Link
                        href={`/events/${event.slug}`}
                        className="font-medium hover:underline"
                      >
                        {event.name}
                      </Link>
                      {event.status === "draft" && (
                        <Badge variant="outline" className="ml-2">
                          Draft
                        </Badge>
                      )}
                      {event.status === "cancelled" && (
                        <Badge variant="destructive" className="ml-2">
                          Cancelled
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {format(new Date(event.date), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.attendee_count || 0}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/events/${event.slug}/edit`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <DeleteEventButton
                        eventId={event.id}
                        eventName={event.name}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="grid" className="mt-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found</p>
              {initialEvents.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              )}
              {initialEvents.length === 0 && (
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link href="/events/create">Create your first event</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedEvents.some((e) => e.id === event.id)}
                      onCheckedChange={() => toggleEventSelection(event)}
                      disabled={isRefreshing}
                      className="bg-background/80 backdrop-blur-sm"
                    />
                  </div>
                  <CardHeader className="p-0">
                    <div className="aspect-video relative">
                      <img
                        src={
                          event.image_url ||
                          "/assets/images/event-placeholder.png"
                        }
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                      {event.status === "draft" && (
                        <Badge
                          variant="outline"
                          className="absolute top-2 right-2 bg-background"
                        >
                          Draft
                        </Badge>
                      )}
                      {event.status === "cancelled" && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 right-2"
                        >
                          Cancelled
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="line-clamp-1 text-lg">
                      <Link
                        href={`/events/${event.slug}`}
                        className="hover:underline"
                      >
                        {event.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {event.description || "No description provided"}
                    </CardDescription>
                    <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{event.attendee_count || 0} attendees</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/events/${event.slug}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <DeleteEventButton
                      eventId={event.id}
                      eventName={event.name}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
