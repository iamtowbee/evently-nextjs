import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEvents } from "@/lib/actions/event";
import { DashboardContent } from "@/components/(dashboard)/dashboard-content";

export const metadata = {
  title: "Dashboard | Evently",
  description: "Manage your events and registrations",
};

export default async function DashboardPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Fetch events created by this user
  const userEvents = await getEvents({
    limit: 50, // Higher limit for dashboard
  });

  // Filter for events where user is the organizer
  const myEvents =
    userEvents?.events.filter(
      (event) => event.organizer_id === session.user.id
    ) || [];

  return (
    <main className="flex-1 py-10">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your events and registrations
            </p>
          </div>

          <DashboardContent initialEvents={myEvents} />
        </div>
      </div>
    </main>
  );
}
