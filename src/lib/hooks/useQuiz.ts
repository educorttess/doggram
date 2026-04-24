"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { awardXP } from "./useXP";
import { DOG_BREEDS } from "@/constants/breeds";
import { XP_REWARDS } from "@/types/engagement";
import type { QuizQuestion } from "@/types/engagement";
import type { Profile } from "@/types/profile";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(dog: Profile): QuizQuestion {
  const correctBreed = dog.breed!;
  const wrong = shuffleArray(
    DOG_BREEDS.filter((b) => b !== correctBreed)
  ).slice(0, 3);
  const options = shuffleArray([correctBreed, ...wrong]);
  return {
    dogProfileId: dog.id,
    imageUrl: dog.avatar_url!,
    correctBreed,
    options,
  };
}

export function useQuiz(currentProfile: Profile | null) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    xpAwarded: number;
    correctBreed: string;
  } | null>(null);

  const loadQuestion = useCallback(async () => {
    if (!currentProfile) return;
    setLoading(true);
    setResult(null);

    // Check if already played today
    const today = new Date().toISOString().split("T")[0];
    if (currentProfile.last_quiz_date === today) {
      setAlreadyPlayed(true);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Fetch dogs attempted today to avoid repeats
    const { data: todayAttempts } = await supabase
      .from("quiz_attempts")
      .select("dog_profile_id")
      .eq("profile_id", currentProfile.id)
      .gte("attempted_at", today);

    const attempted = (todayAttempts ?? []).map((a: any) => a.dog_profile_id).filter(Boolean);

    // Pick a random dog profile with avatar + breed that hasn't been used today
    let query = supabase
      .from("profiles")
      .select("id, dog_name, avatar_url, breed, last_quiz_date")
      .not("avatar_url", "is", null)
      .not("breed", "is", null)
      .neq("id", currentProfile.id);

    if (attempted.length > 0) {
      query = (query as any).not("id", "in", `(${attempted.join(",")})`);
    }

    const { data: candidates } = await query.limit(50);
    const pool = (candidates ?? []) as Profile[];

    if (pool.length === 0) {
      setQuestion(null);
      setLoading(false);
      return;
    }

    const random = pool[Math.floor(Math.random() * pool.length)];
    setQuestion(buildQuestion(random));
    setAlreadyPlayed(false);
    setLoading(false);
  }, [currentProfile]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const submit = useCallback(
    async (chosen: string) => {
      if (!currentProfile || !question || result) return;

      const correct = chosen === question.correctBreed;
      const xpAwarded = correct ? XP_REWARDS.quiz_easy : 0;
      const today = new Date().toISOString().split("T")[0];
      const supabase = createClient();

      // Log attempt
      await supabase.from("quiz_attempts").insert({
        profile_id: currentProfile.id,
        dog_profile_id: question.dogProfileId,
        correct_breed: question.correctBreed,
        chosen_breed: chosen,
        correct,
        xp_awarded: xpAwarded,
      });

      // Update streak
      const yesterday = new Date(Date.now() - 86_400_000)
        .toISOString()
        .split("T")[0];
      const wasYesterday = currentProfile.last_quiz_date === yesterday;
      const newStreak = correct
        ? wasYesterday
          ? (currentProfile.quiz_streak ?? 0) + 1
          : 1
        : currentProfile.quiz_streak ?? 0;

      await supabase
        .from("profiles")
        .update({ last_quiz_date: today, quiz_streak: newStreak })
        .eq("id", currentProfile.id);

      if (correct) {
        await awardXP(currentProfile.id, xpAwarded, "quiz_correct");
      }

      setResult({ correct, xpAwarded, correctBreed: question.correctBreed });
    },
    [currentProfile, question, result]
  );

  return {
    question,
    loading,
    alreadyPlayed,
    result,
    submit,
    nextQuestion: loadQuestion,
  };
}
