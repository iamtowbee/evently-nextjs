"use server";

import { getSupabaseAuth } from "@/lib/auth";
import { Provider } from "@supabase/supabase-js";
export const loginAction = async (provider: Provider) => {
  try {
    const auth = await getSupabaseAuth();
    const { data, error } = await auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`,
      },
    });

    if (error) throw error;

    return { errorMessage: null, url: data.url };
  } catch (error) {
    return { errorMessage: "Error logging in", url: null };
  }
};
