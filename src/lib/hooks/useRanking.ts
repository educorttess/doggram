"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RankingEntry, DogOfDay } from "@/types/engagement";

export function useRanking() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [dogOfDay, setDogOfDay] = useState<DogOfDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();

      const [{ data: topDogs }, { data: todayDog }] = await Promise.all([
        supabase.rpc("top_dogs_this_week", { limit_count: 10 }),
        supabase.rpc("dog_of_today"),
      ]);

      if (!cancelled) {
        setRanking((topDogs as RankingEntry[]) ?? []);
        setDogOfDay(((todayDog as DogOfDay[]) ?? [])[0] ?? null);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { ranking, dogOfDay, loading };
}

export function useDogOfDay() {
  const [dogOfDay, setDogOfDay] = useState<DogOfDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase.rpc("dog_of_today");
      if (!cancelled) {
        setDogOfDay(((data as DogOfDay[]) ?? [])[0] ?? null);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { dogOfDay, loading };
}
