"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Globe, MapPin } from "lucide-react";
import { format, parse, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { createEvent, updateEvent } from "@/lib/actions/event";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { UploadButton } from "@/components/ui/upload-button";
import { CategorySelect } from "@/components/category-select";
import { useSession } from "next-auth/react";
import { Event } from "@/types/event";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/actions/category";

const EVENT_TYPES = [
  {
    id: "in-person",
    label: "In Person",
    description: "Event will be held at a physical location",
    icon: MapPin,
  },
  {
    id: "virtual",
    label: "Virtual",
    description: "Event will be held online",
    icon: Globe,
  },
  {
    id: "hybrid",
    label: "Hybrid",
    description: "Event will be held both online and at a physical location",
    icon: Globe,
  },
] as const;

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Event name must be at least 2 characters.",
    }),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    location: z.string().min(2, {
      message: "Location must be at least 2 characters.",
    }),
    venue: z.string().optional(),
    event_type: z.enum(["in-person", "virtual", "hybrid"] as const, {
      required_error: "Please select an event type.",
    }),
    url: z.string().url().optional().or(z.literal("")),
    date: z.date({
      required_error: "A date is required.",
    }),
    start_time: z.string({
      required_error: "Start time is required.",
    }),
    end_time: z.string({
      required_error: "End time is required.",
    }),
    category_id: z.string({
      required_error: "Please select a category.",
    }),
    is_free: z.boolean().default(false),
    price: z.number().optional(),
    max_attendees: z.number().int().positive().optional(),
    image_url: z.string().url().optional(),
    status: z
      .enum(["draft", "published"] as const, {
        required_error: "Please select a status.",
      })
      .default("draft"),
  })
  .refine(
    (data) => {
      if (data.event_type === "virtual" || data.event_type === "hybrid") {
        return !!data.url;
      }
      return true;
    },
    {
      message: "URL is required for virtual events",
      path: ["url"],
    }
  )
  .refine(
    (data) => {
      const startTime = parse(data.start_time, "HH:mm", data.date);
      const endTime = parse(data.end_time, "HH:mm", data.date);
      return isAfter(endTime, startTime);
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

interface EventFormProps {
  mode?: "create" | "edit";
  event?: Event & {
    virtual_event?: { url: string } | null;
    status?: "draft" | "published";
  };
}

export function EventForm({ mode = "create", event }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await getCategories();
      return result?.categories || [];
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: event?.name || "",
      description: event?.description || "",
      location: event?.location || "",
      venue: event?.venue || "",
      event_type: (event?.virtual_event ? "virtual" : "in-person") as
        | "in-person"
        | "virtual"
        | "hybrid",
      url: event?.virtual_event?.url || "",
      is_free: event?.is_free || false,
      start_time: event?.start_time || "09:00",
      end_time: event?.end_time || "17:00",
      status: event?.status || "draft",
      category_id: event?.category_id || "",
      price: event?.price || undefined,
      max_attendees: event?.max_attendees || undefined,
      image_url: event?.image_url || undefined,
      date: event?.date ? new Date(event.date) : undefined,
    },
  });

  // Watch event type to show/hide conditional fields
  const eventType = form.watch("event_type");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to manage events",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time
      const startDateTime = new Date(values.date);
      const [startHour, startMinute] = values.start_time.split(":").map(Number);
      startDateTime.setHours(startHour, startMinute);

      const endDateTime = new Date(values.date);
      const [endHour, endMinute] = values.end_time.split(":").map(Number);
      endDateTime.setHours(endHour, endMinute);

      const eventData = {
        name: values.name,
        description: values.description,
        location: values.location,
        venue: values.venue || "",
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        categoryId: values.category_id,
        isFree: values.is_free,
        price: values.price,
        maxAttendees: values.max_attendees,
        status: values.status,
        imageUrl: values.image_url,
        eventType: values.event_type,
        url: values.url,
        organizerId: session.user.id,
      };

      const response =
        mode === "create"
          ? await createEvent(eventData)
          : await updateEvent(event!.id, eventData);

      if (response?.success) {
        toast({
          title: "Success",
          description: `Event ${
            mode === "create" ? "created" : "updated"
          } successfully!`,
        });
        router.push(`/events/${response.event?.slug || ""}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error || `Failed to ${mode} event`,
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-8">
          {/* Left Column */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Event Name</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Summer Music Festival 2024"
                      {...field}
                    />
                  </FormControl>
                  <div className="mt-2">
                    <FormDescription>
                      The name of your event as it will appear to attendees.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Description</FormLabel>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Tell people what your event is about..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="mt-2">
                    <FormDescription>
                      Provide details about your event.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Event Type</FormLabel>
                  </div>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-2"
                    >
                      {EVENT_TYPES.map((type) => (
                        <div key={type.id} className="flex-none">
                          <RadioGroupItem
                            value={type.id}
                            id={type.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={type.id}
                            className={cn(
                              "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium ring-offset-background transition-all hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:text-primary",
                              field.value === type.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-muted-foreground/20"
                            )}
                          >
                            <type.icon className="h-3.5 w-3.5" />
                            <span>{type.label}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <div className="mt-2">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {(eventType === "in-person" || eventType === "hybrid") && (
              <>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Location</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="New York, USA" {...field} />
                      </FormControl>
                      <div className="mt-2">
                        <FormDescription>
                          The general location of your event (e.g. city,
                          country)
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Venue</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="Central Park" {...field} />
                      </FormControl>
                      <div className="mt-2">
                        <FormDescription>
                          The specific venue where your event will be held
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}

            {(eventType === "virtual" || eventType === "hybrid") && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Event URL</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        {...field}
                      />
                    </FormControl>
                    <div className="mt-2">
                      <FormDescription>
                        The URL where attendees can join your virtual event
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-1">
                    <div className="mb-2">
                      <FormLabel>Date</FormLabel>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="mt-2">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-1">
                    <div className="mb-2">
                      <FormLabel>Start Time</FormLabel>
                    </div>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <div className="mt-2">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-1">
                    <div className="mb-2">
                      <FormLabel>End Time</FormLabel>
                    </div>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <div className="mt-2">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Category</FormLabel>
                  </div>
                  <CategorySelect
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_attendees"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Maximum Attendees</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="100"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <div className="mt-2">
                    <FormDescription>
                      Leave empty for unlimited attendees
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_free"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Free Event</FormLabel>
                    <FormDescription>
                      Toggle if this is a free event
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!form.watch("is_free") && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Ticket Price</FormLabel>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="29.99"
                          className="pl-7"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </div>
                    </FormControl>
                    <div className="mt-2">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Event Image</FormLabel>
                  </div>
                  <FormControl>
                    <UploadButton
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="mt-2">
                    <FormDescription>
                      Upload an image for your event
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Status</FormLabel>
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Event"
            ) : (
              "Update Event"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
