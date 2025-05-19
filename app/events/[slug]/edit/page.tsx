import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getEventBySlug } from "@/lib/actions/event";
import { EventForm } from "@/components/event-form";

export default async function EditEventPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/events/" + params.slug + "/edit");
  }

  const result = await getEventBySlug(params.slug);
  if (!result.data) {
    notFound();
  }

  const event = result.data;

  // Check if user is the organizer
  if (event.organizer_id !== session.user.id) {
    redirect("/events/" + params.slug + "?error=unauthorized");
  }

  return (
    <main className="flex-1 py-10">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground">
              Update your event details below.
            </p>
          </div>
          <EventForm event={event as any} mode="edit" />
        </div>
      </div>
    </main>
  );
}
