"use client";

import { useEffect, useRef, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, User, AtSign, ChevronDown } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { compressImage } from "@/lib/utils/image";
import { isValidUsername } from "@/lib/utils/validators";
import { DOG_BREEDS } from "@/constants/breeds";
import { MAX_BIO_LENGTH, SUPABASE_STORAGE_BUCKET_AVATARS } from "@/constants/config";
import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, loading: profileLoading, refresh } = useCurrentProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dogName, setDogName] = useState("");
  const [username, setUsername] = useState("");
  const [breed, setBreed] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setDogName(profile.dog_name);
      setUsername(profile.username);
      setBreed(profile.breed ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile?.id]);

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
    if (!profile) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const supabase = createClient();

      // Check username uniqueness only if it changed
      if (username !== profile.username) {
        const { data: taken } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username.toLowerCase())
          .neq("id", profile.id)
          .maybeSingle();

        if (taken) {
          setErrors({ username: "Este username já está em uso. Escolha outro." });
          return;
        }
      }

      // Upload new avatar if selected
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        const compressed = await compressImage(avatarFile);
        const path = `${profile.owner_id}/avatar.webp`;

        const { error: uploadErr } = await supabase.storage
          .from(SUPABASE_STORAGE_BUCKET_AVATARS)
          .upload(path, compressed, { upsert: true, contentType: "image/webp" });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from(SUPABASE_STORAGE_BUCKET_AVATARS)
            .getPublicUrl(path);
          // Bust cache with timestamp query param
          avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
        }
      }

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          dog_name: dogName.trim(),
          username: username.toLowerCase(),
          breed: breed || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateErr) {
        if (updateErr.code === "23505" || updateErr.message.includes("duplicate")) {
          setErrors({ username: "Este username já está em uso. Escolha outro." });
        } else {
          setErrors({ general: `Erro ao salvar: ${updateErr.message}` });
        }
        return;
      }

      await refresh();
      setSaved(true);
      setTimeout(() => router.push("/profile"), 800);
    } finally {
      setLoading(false);
    }
  }

  const currentAvatarSrc = avatarPreview ?? profile?.avatar_url ?? null;

  if (profileLoading) {
    return (
      <div className="animate-fade-in">
        {/* Header skeleton */}
        <div className="sticky top-14 z-30 bg-doggram-cream/95 backdrop-blur-md border-b border-doggram-border">
          <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-12">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <SkeletonCircle size={96} />
            <Skeleton className="h-4 w-28" />
          </div>
          {/* Fields */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ))}
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-doggram-cream">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-doggram-cream/95 backdrop-blur-md border-b border-doggram-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-12">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-doggram-brown-mid hover:text-doggram-orange transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-semibold">Cancelar</span>
          </Link>
          <h1 className="text-base font-bold text-doggram-brown-dark">Editar perfil</h1>
          <Button
            type="submit"
            form="edit-profile-form"
            size="sm"
            loading={loading}
            disabled={saved}
          >
            {saved ? "Salvo!" : "Salvar"}
          </Button>
        </div>
      </div>

      <form
        id="edit-profile-form"
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto px-4 py-6 space-y-5"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-doggram-border bg-doggram-cream flex items-center justify-center text-4xl">
              {currentAvatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentAvatarSrc} alt="avatar" className="w-full h-full object-cover" />
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
          <p className="text-xs text-doggram-brown-soft">Toque para alterar a foto</p>
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
          label="Nome do dog"
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
          label="Username"
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
            <ChevronDown
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-doggram-brown-soft pointer-events-none"
            />
          </div>
        </div>

        {/* Bio */}
        <Textarea
          label="Bio"
          placeholder="Conta um pouco sobre o seu dog…"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
          maxChars={MAX_BIO_LENGTH}
          rows={3}
        />

        {errors.general && (
          <div className="bg-doggram-error/10 border border-doggram-error/30 rounded-2xl px-4 py-3">
            <p className="text-xs text-doggram-error font-semibold">{errors.general}</p>
          </div>
        )}

        {saved && (
          <div className="bg-doggram-success/10 border border-doggram-success/30 rounded-2xl px-4 py-3">
            <p className="text-xs text-doggram-success font-semibold">Perfil atualizado com sucesso!</p>
          </div>
        )}
      </form>
    </div>
  );
}
