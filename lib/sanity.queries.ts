import { groq } from "next-sanity";
import { client } from "./sanity.client";
import { Event } from "@/types/event";

export async function getEvents(): Promise<Event[]> {
  return client.fetch(
    groq`*[_type == "event"] | order(startDateTime asc) {
      _id,
      name,
      "slug": slug.current,
      startDateTime,
      endDateTime,
      location,
      description,
      "category": category->name,
      "image": image.asset->url,
      isFree,
      price
    }`
  );
}

export async function getFeaturedEvents(): Promise<Event[]> {
  return client.fetch(
    groq`*[_type == "event" && featured == true] | order(startDateTime asc) {
      _id,
      name,
      "slug": slug.current,
      startDateTime,
      endDateTime,
      location,
      description,
      "category": category->name,
      "image": image.asset->url,
      isFree,
      price
    }[0...3]`
  );
}

export async function getEventsByCategory(category: string): Promise<Event[]> {
  return client.fetch(
    groq`*[_type == "event" && category->name == $category] | order(startDateTime asc) {
      _id,
      name,
      "slug": slug.current,
      startDateTime,
      endDateTime,
      location,
      description,
      "category": category->name,
      "image": image.asset->url,
      isFree,
      price
    }`,
    { category }
  );
}
