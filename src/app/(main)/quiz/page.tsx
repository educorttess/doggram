"use client";

import Image from "next/image";
import Link from "next/link";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { useQuiz } from "@/lib/hooks/useQuiz";
import { XPBar } from "@/components/engagement/XPBar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function QuizPage() {
  const { profile, loading: profileLoading } = useCurrentProfile();
  const { question, loading, alreadyPlayed, result, submit, nextQuestion } =
    useQuiz(profile ?? null);

  if (profileLoading || loading) {
    return (
      <div className="px-4 pt-5 pb-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Already played today
  if (alreadyPlayed) {
    return (
      <div className="px-4 pt-5 pb-6 space-y-4">
        <h1 className="text-xl font-black text-doggram-brown-dark">Quiz de Raças</h1>
        {profile && (
          <XPBar xp={profile.xp ?? 0} quizStreak={profile.quiz_streak ?? 0} />
        )}
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center bg-doggram-warm-white rounded-3xl border border-doggram-border shadow-warm">
          <span className="text-6xl">🌙</span>
          <h2 className="text-lg font-black text-doggram-brown-dark">Você já jogou hoje!</h2>
          <div className="flex items-center gap-2 text-base font-bold text-doggram-amber">
            <span>🔥</span>
            <span>Streak: {profile?.quiz_streak ?? 0} dia{(profile?.quiz_streak ?? 0) !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-sm text-doggram-brown-soft font-medium max-w-[220px] leading-relaxed">
            Volte amanhã para manter seu streak e ganhar mais XP!
          </p>
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

  // No questions available
  if (!question) {
    return (
      <div className="px-4 pt-5 pb-6 space-y-4">
        <h1 className="text-xl font-black text-doggram-brown-dark">Quiz de Raças</h1>
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center bg-doggram-warm-white rounded-3xl border border-doggram-border shadow-warm">
          <span className="text-6xl">🐾</span>
          <h2 className="text-lg font-black text-doggram-brown-dark">Sem perguntas ainda</h2>
          <p className="text-sm text-doggram-brown-soft font-medium max-w-[240px] leading-relaxed">
            O quiz usa fotos de dogs cadastrados com raça e foto. Quando mais dogs entrarem, o quiz ficará disponível!
          </p>
          <Link
            href="/feed"
            className="px-6 py-3 rounded-2xl gradient-doggram text-white font-bold text-sm shadow-warm transition-transform active:scale-95"
          >
            Explorar dogs
          </Link>
        </div>
      </div>
    );
  }

  const answered = result !== null;

  return (
    <div className="px-4 pt-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-doggram-brown-dark">Quiz de Raças</h1>
          <p className="text-sm text-doggram-brown-soft font-medium">Que raça é este dog?</p>
        </div>
        {(profile?.quiz_streak ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-doggram-amber/15 border border-doggram-amber/30">
            <span>🔥</span>
            <span className="text-sm font-black text-doggram-amber">
              {profile?.quiz_streak}
            </span>
          </div>
        )}
      </div>

      {/* Dog photo */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-doggram-border mb-5 shadow-warm-md">
        <Image
          src={question.imageUrl}
          alt="Que raça é este dog?"
          fill
          className="object-cover"
          sizes="(max-width: 512px) 100vw, 512px"
          priority
        />

        {/* Result overlay */}
        {answered && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-2 animate-fade-in
              ${result.correct
                ? "bg-doggram-success/70"
                : "bg-doggram-error/70"
              }`}
          >
            <span className="text-7xl leading-none">
              {result.correct ? "✅" : "❌"}
            </span>
            <p className="text-white font-black text-xl drop-shadow">
              {result.correct ? "Acertou!" : "Errou!"}
            </p>
            {result.correct && (
              <p className="text-white font-bold text-sm drop-shadow">
                +{result.xpAwarded} XP
              </p>
            )}
            {!result.correct && (
              <p className="text-white font-semibold text-sm drop-shadow text-center px-4">
                Era: {result.correctBreed}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {question.options.map((option) => {
          const isCorrect = option === question.correctBreed;
          const isChosen = answered && option === (result.correct ? question.correctBreed : question.options.find(o => o !== question.correctBreed && result && !result.correct));

          let btnClass = "py-4 px-3 rounded-2xl text-sm font-bold text-center transition-all duration-200 border-2 ";

          if (!answered) {
            btnClass += "bg-doggram-warm-white border-doggram-border text-doggram-brown-dark hover:border-doggram-orange hover:text-doggram-orange hover:bg-doggram-orange/5 active:scale-95";
          } else if (isCorrect) {
            btnClass += "bg-doggram-success/15 border-doggram-success text-doggram-success";
          } else {
            btnClass += "bg-doggram-cream border-doggram-border text-doggram-brown-soft opacity-60";
          }

          return (
            <button
              key={option}
              onClick={() => !answered && submit(option)}
              disabled={answered}
              className={btnClass}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* After answer: next or done */}
      {answered && (
        <div className="space-y-3 animate-slide-up">
          {result.correct && (
            <div className="p-3 rounded-2xl bg-doggram-amber/10 border border-doggram-amber/30 text-center">
              <p className="text-sm font-bold text-doggram-amber">
                🔥 Streak: {(profile?.quiz_streak ?? 0) + 1} dia{((profile?.quiz_streak ?? 0) + 1) !== 1 ? "s" : ""}!
              </p>
            </div>
          )}
          <button
            onClick={nextQuestion}
            className="w-full py-3.5 rounded-2xl gradient-doggram text-white font-bold text-sm shadow-warm transition-transform active:scale-95"
          >
            Próxima pergunta 🐾
          </button>
          <Link
            href="/feed"
            className="block w-full text-center py-3 rounded-2xl border-2 border-doggram-border text-doggram-brown-soft font-semibold text-sm transition-colors hover:border-doggram-orange hover:text-doggram-orange"
          >
            Ir para o feed
          </Link>
        </div>
      )}
    </div>
  );
}
