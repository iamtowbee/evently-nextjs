import { CreateEventForm } from "@/components/create-event-form";

export default function CreateEventPage() {
  return (
    <main className="flex-1 py-10">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create New Event</h1>
            <p className="text-muted-foreground">
              Fill in the details below to create a new event.
            </p>
          </div>
          <CreateEventForm />
        </div>
      </div>
    </main>
  );
}
