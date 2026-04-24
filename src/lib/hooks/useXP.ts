"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Atomic XP award via Supabase RPC.
 * The `award_xp` postgres function updates xp + level + logs the event in one transaction.
 */
export async function awardXP(
  profileId: string,
  amount: number,
  reason: string
): Promise<void> {
  if (!profileId || amount <= 0) return;
  const supabase = createClient();
  await supabase.rpc("award_xp", {
    p_profile_id: profileId,
    p_amount: amount,
    p_reason: reason,
  });
}

/** Hook version for use inside components that need a stable callback. */
export function useXP(profileId: string | null) {
  const award = useCallback(
    (amount: number, reason: string) => {
      if (!profileId) return Promise.resolve();
      return awardXP(profileId, amount, reason);
    },
    [profileId]
  );

  return { award };
}
