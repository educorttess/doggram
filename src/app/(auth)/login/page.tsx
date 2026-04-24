"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos."
            : authError.message
        );
        return;
      }

      router.push("/feed");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Logo */}
      <div className="text-center mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/doggram-logo.svg" alt="Doggram" className="w-16 h-16 mx-auto mb-3" />
        <h1
          className="font-black text-transparent bg-clip-text bg-gradient-to-r from-doggram-orange to-doggram-amber"
          style={{ fontSize: 32 }}
        >
          Doggram
        </h1>
        <p className="text-doggram-brown-soft text-sm mt-1 font-medium">
          A rede social dos melhores amigos
        </p>
      </div>

      {/* Card */}
      <div className="bg-doggram-warm-white border border-doggram-border rounded-3xl shadow-warm-md p-6">
        <h2 className="text-lg font-bold text-doggram-brown-dark mb-5">Entrar</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seucao@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} />}
            required
            autoComplete="email"
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={16} />}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="bg-doggram-error/10 border border-doggram-error/30 rounded-2xl px-4 py-3">
              <p className="text-xs text-doggram-error font-semibold">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-doggram-orange font-semibold hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Entrar
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-doggram-border" />
          <span className="text-xs text-doggram-brown-soft font-medium">ou</span>
          <div className="flex-1 h-px bg-doggram-border" />
        </div>

        {/* Google */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-doggram-border bg-white hover:border-doggram-orange/40 transition-colors font-semibold text-sm text-doggram-brown-dark"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-doggram-brown-soft mt-6">
        Ainda não tem conta?{" "}
        <Link href="/register" className="text-doggram-orange font-bold hover:underline">
          Cadastre-se
        </Link>
      </p>
    </>
  );
}
