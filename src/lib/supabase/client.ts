"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // Cast to any so TS doesn't reject our hand-written Database type.
  // Replace with `pnpm db:generate` output once the Supabase project is set up.
  ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
