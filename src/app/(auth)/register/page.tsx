"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/setup-profile` },
      });

      if (authError) {
        setError(
          authError.message.includes("already registered")
            ? "Este e-mail já está cadastrado."
            : authError.message
        );
        return;
      }

      // If email confirmation is disabled, redirect directly
      router.push("/setup-profile");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-xl font-black text-doggram-brown-dark mb-2">Confira seu e-mail!</h2>
        <p className="text-sm text-doggram-brown-soft">
          Enviamos um link de confirmação para{" "}
          <span className="font-semibold text-doggram-orange">{email}</span>. Clique no link para
          ativar sua conta.
        </p>
      </div>
    );
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
          Cadastre-se e apresente seu dog ao mundo
        </p>
      </div>

      {/* Card */}
      <div className="bg-doggram-warm-white border border-doggram-border rounded-3xl shadow-warm-md p-6">
        <h2 className="text-lg font-bold text-doggram-brown-dark mb-5">Criar conta</h2>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
            placeholder="Mín. 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={16} />}
            hint="Use pelo menos 8 caracteres"
            required
            autoComplete="new-password"
          />

          <div className="relative">
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
              autoComplete="new-password"
            />
            {passwordsMatch && (
              <CheckCircle2
                size={18}
                className="absolute right-3.5 bottom-3 text-doggram-success pointer-events-none"
              />
            )}
          </div>

          {error && (
            <div className="bg-doggram-error/10 border border-doggram-error/30 rounded-2xl px-4 py-3">
              <p className="text-xs text-doggram-error font-semibold">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
            Criar conta
          </Button>
        </form>

        {/* Terms */}
        <p className="text-xs text-doggram-brown-soft text-center mt-4 leading-relaxed">
          Ao criar uma conta, você concorda com nossos{" "}
          <span className="text-doggram-orange font-semibold cursor-pointer hover:underline">
            Termos de Uso
          </span>{" "}
          e{" "}
          <span className="text-doggram-orange font-semibold cursor-pointer hover:underline">
            Política de Privacidade
          </span>
          .
        </p>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-doggram-brown-soft mt-6">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-doggram-orange font-bold hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
