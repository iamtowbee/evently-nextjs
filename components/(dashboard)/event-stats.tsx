"use client";

import * as React from "react";
import {
  Calendar,
  Users,
  Eye,
  TicketCheck,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Event } from "@/types/event";

interface EventStatsProps {
  events: Event[];
}

export function EventStats({ events }: EventStatsProps) {
  // Calculate stats
  const stats = React.useMemo(() => {
    // Use type assertion since 'status' exists in the database model but not in the TypeScript interface
    const activeEvents = events.filter(
      (e) => (e as any).status !== "cancelled"
    );
    const draftEvents = events.filter((e) => (e as any).status === "draft");
    const publishedEvents = events.filter(
      (e) => (e as any).status === "published"
    );
    const cancelledEvents = events.filter(
      (e) => (e as any).status === "cancelled"
    );

    const totalAttendees = events.reduce(
      (acc, event) => acc + (event.attendee_count || 0),
      0
    );
    const activeAttendees = activeEvents.reduce(
      (acc, event) => acc + (event.attendee_count || 0),
      0
    );

    // Calculate upcoming events (events in the future)
    const now = new Date();
    const upcomingEvents = activeEvents.filter(
      (event) => new Date(event.date) > now
    );

    // Calculate most popular event (event with most attendees)
    const mostPopularEvent =
      events.length > 0
        ? events.reduce((prev, current) =>
            (prev.attendee_count || 0) > (current.attendee_count || 0)
              ? prev
              : current
          )
        : null;

    return {
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      draftEvents: draftEvents.length,
      publishedEvents: publishedEvents.length,
      cancelledEvents: cancelledEvents.length,
      totalAttendees,
      activeAttendees,
      upcomingEvents: upcomingEvents.length,
      mostPopularEvent,
    };
  }, [events]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeEvents} active, {stats.draftEvents} drafts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAttendees}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeAttendees} for active events
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          <p className="text-xs text-muted-foreground">
            Events scheduled in the future
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Most Popular Event
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold truncate">
            {stats.mostPopularEvent ? (
              <span className="truncate">{stats.mostPopularEvent.name}</span>
            ) : (
              "No events yet"
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.mostPopularEvent
              ? `${stats.mostPopularEvent.attendee_count || 0} attendees`
              : "Create your first event"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
