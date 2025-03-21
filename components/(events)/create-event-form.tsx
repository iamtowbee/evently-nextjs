"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarCog, CalendarIcon, Globe, MapPin, Rss } from "lucide-react";
import { format } from "date-fns";
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
import { createEvent } from "@/lib/actions/event";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { UploadButton } from "@/components/ui/upload-button";
import { CategorySelect } from "@/components/(categories)/category-select";

const EVENT_TYPES = [
  {
    id: "in-person",
    label: "Physical",
    description: "Event holds at a physical location",
    icon: MapPin,
  },
  {
    id: "virtual",
    label: "Virtual",
    description: "Event holds online",
    icon: Rss,
  },
  {
    id: "hybrid",
    label: "Hybrid",
    description: "Event holds online and onsite",
    icon: CalendarCog,
  },
] as const;

const formSchema = z.object({
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
});

export function CreateEventForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      venue: "",
      event_type: "in-person",
      url: "",
      is_free: false,
      start_time: "09:00",
      end_time: "17:00",
      status: "draft",
    },
  });

  // Watch event type to show/hide conditional fields
  const eventType = form.watch("event_type");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Combine date and time
      const startDateTime = new Date(values.date);
      const [startHour, startMinute] = values.start_time.split(":").map(Number);
      startDateTime.setHours(startHour, startMinute);

      const endDateTime = new Date(values.date);
      const [endHour, endMinute] = values.end_time.split(":").map(Number);
      endDateTime.setHours(endHour, endMinute);

      const response = await createEvent({
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
      });

      if (response?.success) {
        toast({
          title: "Success",
          description: "Event created successfully!",
        });
        router.push("/");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error || "Failed to create event",
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
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summer Music Festival 2024"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your event as it will appear to attendees.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell people what your event is about..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {EVENT_TYPES.map((type) => (
                        <FormItem key={type.id}>
                          <FormControl>
                            <Label
                              htmlFor={type.id}
                              className={cn(
                                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground relative",
                                field.value === type.id &&
                                  "border-primary [&:has([data-state=checked])]:border-primary"
                              )}
                            >
                              <RadioGroupItem
                                value={type.id}
                                id={type.id}
                                className="sr-only"
                              />

                              <div className="space-y-1 text-center">
                                <div className="flex items-center gap-2">
                                  <type.icon className="text-sm" />
                                  <h4 className="font-medium leading-none text-left">
                                    {type.label}
                                  </h4>
                                  <p className="text-xs">{type.description}</p>
                                </div>
                              </div>
                            </Label>
                          </FormControl>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
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
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="New York, USA" {...field} />
                      </FormControl>
                      <FormDescription>
                        The general location of your event (e.g. city, country)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="Central Park" {...field} />
                      </FormControl>
                      <FormDescription>
                        The specific venue where your event will be held
                      </FormDescription>
                      <FormMessage />
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
                    <FormLabel>Event URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL where attendees can join your virtual event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-[2fr,1fr,1fr]">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <CategorySelect
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                />
              )}
            />

            <FormField
              control={form.control}
              name="max_attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Attendees</FormLabel>
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
                  <FormDescription>
                    Leave empty for unlimited attendees
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_free"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
                    <FormLabel>Ticket Price</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Image</FormLabel>
                  <FormControl>
                    <UploadButton
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image for your event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                Creating...
              </>
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
