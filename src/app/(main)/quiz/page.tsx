"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Trophy, Flame, ChevronRight } from "lucide-react";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { XPBar } from "@/components/engagement/XPBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { awardXP } from "@/lib/hooks/useXP";
import { getDailyQuestions, type LocalQuizQuestion } from "@/constants/quizQuestions";

const TIMER_SECONDS = 15;
const FEEDBACK_MS = 1400;
const TIMEOUT_SENTINEL = "__timeout__";

function calcXP(score: number) {
  if (score === 5) return 40;
  if (score >= 3) return 25;
  if (score >= 1) return 15;
  return 0;
}

function scoreEmoji(score: number) {
  if (score === 5) return "🏆";
  if (score === 4) return "🎯";
  if (score === 3) return "🐾";
  if (score >= 1) return "😅";
  return "😢";
}

function scoreTitle(score: number) {
  if (score === 5) return "Perfeito!";
  if (score === 4) return "Ótimo!";
  if (score === 3) return "Bom trabalho!";
  if (score >= 1) return "Continue tentando!";
  return "Não desista!";
}

type Phase = "idle" | "playing" | "already_played" | "result";

export default function QuizPage() {
  const { profile, loading: profileLoading, refresh: refreshProfile } = useCurrentProfile();

  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<LocalQuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);
  const [shouldFinish, setShouldFinish] = useState(false);

  /* ── Initialize quiz ── */
  useEffect(() => {
    if (profileLoading || !profile) return;
    const today = new Date().toISOString().split("T")[0];
    if (profile.last_quiz_date === today) {
      setPhase("already_played");
      return;
    }
    const qs = getDailyQuestions();
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(""));
    setPhase("playing");
  }, [profile, profileLoading]);

  /* ── Reset timer on new question ── */
  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(TIMER_SECONDS);
    setFeedbackFor(null);
  }, [qIndex, phase]);

  /* ── Timer countdown ── */
  useEffect(() => {
    if (phase !== "playing" || feedbackFor !== null) return;
    if (timeLeft <= 0) {
      setAnswers((prev) => {
        const next = [...prev];
        next[qIndex] = TIMEOUT_SENTINEL;
        return next;
      });
      setFeedbackFor(TIMEOUT_SENTINEL);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, feedbackFor, qIndex]);

  /* ── Auto-advance after feedback ── */
  useEffect(() => {
    if (feedbackFor === null) return;
    const id = setTimeout(() => {
      if (qIndex < questions.length - 1) {
        setQIndex((i) => i + 1);
      } else {
        setShouldFinish(true);
      }
    }, FEEDBACK_MS);
    return () => clearTimeout(id);
  }, [feedbackFor, qIndex, questions.length]);

  /* ── Finish quiz ── */
  useEffect(() => {
    if (!shouldFinish || !profile || saving) return;
    setShouldFinish(false);

    const currentAnswers = [...answers];
    const currentQuestions = [...questions];
    const score = currentAnswers.filter((a, i) => a === currentQuestions[i]?.correct).length;
    const xp = calcXP(score);

    async function finish() {
      setSaving(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
        const newStreak =
          profile!.last_quiz_date === yesterday ? (profile!.quiz_streak ?? 0) + 1 : 1;

        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({ last_quiz_date: today, quiz_streak: newStreak })
          .eq("id", profile!.id);

        if (xp > 0) {
          await awardXP(profile!.id, xp, "quiz_daily");
        }

        setXpEarned(xp);
        refreshProfile();
      } finally {
        setSaving(false);
        setPhase("result");
      }
    }

    finish();
  }, [shouldFinish, profile, saving, answers, questions, refreshProfile]);

  const handleAnswer = useCallback(
    (choice: string) => {
      if (feedbackFor !== null) return;
      setAnswers((prev) => {
        const next = [...prev];
        next[qIndex] = choice;
        return next;
      });
      setFeedbackFor(choice);
    },
    [feedbackFor, qIndex]
  );

  /* ── Render: Loading ── */
  if (profileLoading || phase === "idle") {
    return (
      <div className="px-4 pt-5 pb-6 space-y-4">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-36 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  /* ── Render: Already played ── */
  if (phase === "already_played") {
    return (
      <div className="px-4 pt-5 pb-6 space-y-4">
        <h1 className="text-xl font-black text-doggram-brown-dark">Quiz de Raças 🐾</h1>
        {profile && (
          <XPBar xp={profile.xp ?? 0} quizStreak={profile.quiz_streak ?? 0} />
        )}
        <div className="flex flex-col items-center gap-4 py-14 text-center bg-doggram-warm-white rounded-3xl border border-doggram-border shadow-warm">
          <span className="text-6xl">🌙</span>
          <div>
            <h2 className="text-lg font-black text-doggram-brown-dark mb-1">Você já jogou hoje!</h2>
            <p className="text-sm text-doggram-brown-soft font-medium">Volte amanhã para manter seu streak.</p>
          </div>
          {(profile?.quiz_streak ?? 0) > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-doggram-amber/15 border border-doggram-amber/30">
              <Flame size={16} className="text-doggram-amber" />
              <span className="text-sm font-black text-doggram-amber">
                Streak: {profile?.quiz_streak} dia{(profile?.quiz_streak ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          <Link
            href="/feed"
            className="px-6 py-3 rounded-2xl gradient-doggram text-white font-bold text-sm shadow-warm transition-transform active:scale-95"
          >
            Ir para o feed
          </Link>
        </div>
      </div>
    );
  }

  /* ── Render: Result ── */
  if (phase === "result") {
    const score = answers.filter((a, i) => a === questions[i]?.correct).length;

    return (
      <div className="px-4 pt-5 pb-8 space-y-4 animate-fade-in">
        <h1 className="text-xl font-black text-doggram-brown-dark">Quiz de Raças 🐾</h1>

        {/* Score card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-doggram-orange to-doggram-amber p-6 text-center shadow-warm-md">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative">
            <span className="text-6xl block mb-3">{scoreEmoji(score)}</span>
            <h2 className="text-2xl font-black text-white mb-1">{scoreTitle(score)}</h2>
            <p className="text-white/80 font-bold text-sm mb-4">
              {score} de {questions.length} acertos
            </p>
            {xpEarned > 0 ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30">
                <Trophy size={16} className="text-white" />
                <span className="text-white font-black text-sm">+{xpEarned} XP ganho!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30">
                <span className="text-white font-semibold text-sm">Estude mais para ganhar XP!</span>
              </div>
            )}
          </div>
        </div>

        {/* XP bar */}
        {profile && (
          <XPBar xp={(profile.xp ?? 0) + xpEarned} quizStreak={profile.quiz_streak ?? 1} />
        )}

        {/* Per-question recap */}
        <div className="bg-doggram-warm-white rounded-3xl border border-doggram-border shadow-warm divide-y divide-doggram-border overflow-hidden">
          {questions.map((q, i) => {
            const chosen = answers[i];
            const correct = chosen === q.correct;
            const timedOut = chosen === TIMEOUT_SENTINEL;

            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 shrink-0">
                  {correct
                    ? <CheckCircle2 size={20} className="text-doggram-success" />
                    : <XCircle size={20} className="text-doggram-error" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-doggram-brown-soft leading-snug mb-0.5 line-clamp-2">
                    {q.emoji} {q.question}
                  </p>
                  <p className="text-sm font-bold text-doggram-brown-dark">{q.correct}</p>
                  {!correct && !timedOut && chosen && (
                    <p className="text-xs text-doggram-error font-medium">Você disse: {chosen}</p>
                  )}
                  {timedOut && (
                    <p className="text-xs text-doggram-brown-soft font-medium flex items-center gap-1">
                      <Clock size={11} /> Tempo esgotado
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <Link
          href="/feed"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl gradient-doggram text-white font-bold text-sm shadow-warm transition-transform active:scale-95"
        >
          Ir para o feed <ChevronRight size={16} />
        </Link>
        <Link
          href="/achievements"
          className="block w-full text-center py-3 rounded-2xl border-2 border-doggram-border text-doggram-brown-soft font-semibold text-sm hover:border-doggram-orange hover:text-doggram-orange transition-colors"
        >
          Ver conquistas
        </Link>
      </div>
    );
  }

  /* ── Render: Playing ── */
  const question = questions[qIndex];
  if (!question) return null;

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor =
    timeLeft > 8 ? "bg-doggram-orange" : timeLeft > 4 ? "bg-doggram-amber" : "bg-doggram-error";
  const answered = feedbackFor !== null;

  return (
    <div className="px-4 pt-5 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-doggram-brown-dark">Quiz de Raças</h1>
          <p className="text-sm text-doggram-brown-soft font-medium">
            Pergunta {qIndex + 1} de {questions.length}
          </p>
        </div>
        {(profile?.quiz_streak ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-doggram-amber/15 border border-doggram-amber/30">
            <Flame size={14} className="text-doggram-amber" />
            <span className="text-sm font-black text-doggram-amber">{profile?.quiz_streak}</span>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {questions.map((q, i) => {
          const isAnswered = answers[i] !== "" && answers[i] !== undefined;
          const isCorrect = isAnswered && answers[i] === q.correct;
          const isCurrent = i === qIndex;
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                isAnswered && isCorrect
                  ? "bg-doggram-success"
                  : isAnswered && !isCorrect
                  ? "bg-doggram-error"
                  : isCurrent
                  ? "bg-doggram-orange"
                  : "bg-doggram-border"
              }`}
            />
          );
        })}
      </div>

      {/* Timer bar */}
      <div className="h-1.5 w-full rounded-full bg-doggram-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerColor}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Question card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-doggram-orange to-doggram-amber p-6 shadow-warm-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative flex items-start gap-4">
          <span className="text-4xl shrink-0 mt-0.5">{question.emoji}</span>
          <div className="flex-1">
            <p className="text-white font-black text-base leading-snug">{question.question}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <Clock size={13} className="text-white/70" />
              <span
                className={`text-sm font-black ${
                  timeLeft <= 4 ? "text-white animate-pulse" : "text-white/80"
                }`}
              >
                {answered ? "—" : `${timeLeft}s`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option) => {
          const isCorrect = option === question.correct;
          const isChosen = option === feedbackFor;
          const isTimeout = feedbackFor === TIMEOUT_SENTINEL;

          let cls =
            "py-4 px-3 rounded-2xl text-sm font-bold text-center transition-all duration-200 border-2 leading-snug ";

          if (!answered) {
            cls +=
              "bg-doggram-warm-white border-doggram-border text-doggram-brown-dark hover:border-doggram-orange hover:text-doggram-orange hover:bg-doggram-orange/5 active:scale-95 cursor-pointer";
          } else if (isCorrect) {
            cls += "bg-doggram-success/15 border-doggram-success text-doggram-success";
          } else if (isChosen && !isTimeout) {
            cls += "bg-doggram-error/15 border-doggram-error text-doggram-error";
          } else {
            cls +=
              "bg-doggram-cream border-doggram-border text-doggram-brown-soft opacity-50 cursor-default";
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={answered}
              className={cls}
            >
              <span className="block">
                {answered && isCorrect && "✓ "}
                {answered && isChosen && !isCorrect && !isTimeout && "✗ "}
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Saving indicator */}
      {saving && (
        <p className="text-center text-sm text-doggram-brown-soft animate-pulse">
          Salvando resultado…
        </p>
      )}
    </div>
  );
}
