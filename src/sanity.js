import SanityClient from "@sanity/client";
import ImageUrlBuilder from "@sanity/image-url";

export const sanityClient = SanityClient({
  projectId: "your-project-id", // replace with your project ID
  dataset: "production",
  useCdn: true, // `false` if you want to ensure fresh data
});

const builder = ImageUrlBuilder(sanityClient);

export const urlFor = (source) => builder.image(source);
