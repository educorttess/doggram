"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, User, AtSign, ChevronDown, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { compressImage } from "@/lib/utils/image";
import { isValidUsername } from "@/lib/utils/validators";
import { DOG_BREEDS } from "@/constants/breeds";
import { MAX_BIO_LENGTH } from "@/constants/config";

export default function SetupProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dogName, setDogName] = useState("");
  const [username, setUsername] = useState("");
  const [breed, setBreed] = useState("");
  const [bio, setBio] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleAvatarSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!dogName.trim()) errs.dogName = "Nome do dog é obrigatório.";
    if (!username.trim()) {
      errs.username = "Username é obrigatório.";
    } else if (!isValidUsername(username)) {
      errs.username = "Use apenas letras minúsculas, números e _ (3-30 caracteres).";
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Guard: if owner already has a profile, just go to feed
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (existing) {
        router.push("/feed");
        return;
      }

      // Check username availability before full submit
      const { data: takenBy } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .maybeSingle();
      if (takenBy) {
        setErrors({ username: "Este username já está em uso. Escolha outro." });
        return;
      }

      // Upload avatar if selected
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const compressed = await compressImage(avatarFile);
        const path = `${user.id}/avatar.webp`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, compressed, { upsert: true, contentType: "image/webp" });

        if (!uploadError) {
          const { data } = supabase.storage.from("avatars").getPublicUrl(path);
          avatarUrl = data.publicUrl;
        }
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        owner_id: user.id,
        username: username.toLowerCase(),
        dog_name: dogName.trim(),
        breed: breed || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        birth_date: birthDate || null,
      });

      if (profileError) {
        // RLS blocking: policies may not be applied in Supabase dashboard
        if (profileError.code === "42501") {
          setErrors({ general: "Permissão negada. Verifique as RLS policies no Supabase (veja o console)." });
          console.error("RLS error — run the SQL policies from supabase/migrations/0002_rls_fix.sql in the Supabase dashboard.");
          return;
        }
        if (profileError.code === "23505" || profileError.message.includes("duplicate")) {
          setErrors({ username: "Este username já está em uso. Escolha outro." });
          return;
        }
        setErrors({ general: `Erro: ${profileError.message} (code: ${profileError.code})` });
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
      {/* Header */}
      <div className="text-center mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/doggram-logo.svg" alt="Doggram" className="w-16 h-16 mx-auto mb-3" />
        <h1 className="text-2xl font-black text-doggram-brown-dark">Crie o perfil do seu dog</h1>
        <p className="text-sm text-doggram-brown-soft mt-1">
          Apresente seu melhor amigo ao mundo!
        </p>
      </div>

      <div className="bg-doggram-warm-white border border-doggram-border rounded-3xl shadow-warm-md p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-doggram-border bg-doggram-cream flex items-center justify-center text-4xl">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  "🐕"
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-doggram-brown-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={22} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-doggram-orange to-doggram-amber flex items-center justify-center shadow-warm">
                <Camera size={14} className="text-white" />
              </div>
            </button>
            <p className="text-xs text-doggram-brown-soft">Foto do seu dog (opcional)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>

          {/* Dog name */}
          <Input
            label="Nome do dog *"
            type="text"
            placeholder="Ex: Thor, Luna, Bolinha…"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            leftIcon={<User size={16} />}
            error={errors.dogName}
            maxLength={50}
            required
          />

          {/* Username */}
          <Input
            label="Username *"
            type="text"
            placeholder="thor_labrador"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            leftIcon={<AtSign size={16} />}
            error={errors.username}
            hint="Letras minúsculas, números e _ (3-30 caracteres)"
            maxLength={30}
            required
          />

          {/* Breed */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-doggram-brown-mid">Raça</label>
            <div className="relative">
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full appearance-none bg-doggram-warm-white border border-doggram-border rounded-2xl py-3 pl-4 pr-10 text-sm font-medium text-doggram-brown-dark outline-none transition-all duration-200 focus:border-doggram-orange focus:ring-2 focus:ring-doggram-orange/20"
              >
                <option value="">Selecione a raça (opcional)</option>
                {DOG_BREEDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-doggram-brown-soft pointer-events-none" />
            </div>
          </div>

          {/* Bio */}
          <Textarea
            label="Bio"
            placeholder="Conta um pouco sobre o seu dog: o que ele ama, suas travessuras favoritas…"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
            maxChars={MAX_BIO_LENGTH}
            rows={3}
          />

          {/* Birth date */}
          <Input
            label="Data de nascimento"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            leftIcon={<Calendar size={16} />}
            max={new Date().toISOString().split("T")[0]}
          />

          {errors.general && (
            <div className="bg-doggram-error/10 border border-doggram-error/30 rounded-2xl px-4 py-3">
              <p className="text-xs text-doggram-error font-semibold">{errors.general}</p>
            </div>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
            Criar perfil
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-doggram-brown-soft mt-5">
        Você pode editar tudo isso depois no seu perfil
      </p>
    </>
  );
}
