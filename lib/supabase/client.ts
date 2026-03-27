import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = "message" in error && typeof error.message === "string"
    ? error.message
    : "";

  return (
    message.includes("Invalid Refresh Token") ||
    message.includes("Refresh Token Not Found")
  );
}

export async function getUserOrNull(
  client: SupabaseClient
): Promise<User | null> {
  try {
    const { data, error } = await client.auth.getUser();

    if (error) {
      if (isInvalidRefreshTokenError(error)) {
        await client.auth.signOut({ scope: "local" });
      }
      return null;
    }

    return data.user ?? null;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await client.auth.signOut({ scope: "local" });
    }
    return null;
  }
}