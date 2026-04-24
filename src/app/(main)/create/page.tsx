"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { compressImage } from "@/lib/utils/image";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { MAX_CAPTION_LENGTH } from "@/constants/config";

export default function CreatePage() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Selecione uma imagem válida."); return; }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function removeImage() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePublish(e: FormEvent) {
    e.preventDefault();
    if (!file || !profile) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Compress and upload
      const compressed = await compressImage(file);
      const filename = `${profile.id}/${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filename, compressed, { contentType: "image/webp", upsert: false });

      if (uploadError) {
        setError("Erro ao fazer upload da imagem. Verifique se o bucket 'posts' existe.");
        return;
      }

      const { data: urlData } = supabase.storage.from("posts").getPublicUrl(filename);

      const { error: insertError } = await supabase.from("posts").insert({
        profile_id: profile.id,
        image_url: urlData.publicUrl,
        caption: caption.trim() || null,
      });

      if (insertError) { setError(insertError.message); return; }

      router.push("/feed");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-doggram-cream">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-doggram-cream/90 backdrop-blur-md border-b border-doggram-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-12">
          <Link href="/feed" className="flex items-center gap-1.5 text-doggram-brown-mid hover:text-doggram-orange transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-semibold">Cancelar</span>
          </Link>
          <h1 className="text-base font-bold text-doggram-brown-dark">Novo post</h1>
          <Button
            type="submit"
            form="create-form"
            size="sm"
            loading={loading}
            disabled={!file || !profile}
          >
            Publicar
          </Button>
        </div>
      </div>

      <form id="create-form" onSubmit={handlePublish} className="max-w-lg mx-auto">
        {/* Image area */}
        {!preview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square flex flex-col items-center justify-center gap-4 bg-doggram-warm-white border-b border-doggram-border cursor-pointer hover:bg-doggram-border/30 transition-colors"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-doggram-orange/20 to-doggram-amber/20 flex items-center justify-center">
              <ImagePlus size={36} className="text-doggram-orange" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-doggram-brown-dark">Adicionar foto</p>
              <p className="text-sm text-doggram-brown-soft mt-1">
                Toque para escolher da galeria
              </p>
            </div>
          </button>
        ) : (
          <div className="relative aspect-square w-full bg-doggram-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-doggram-brown-dark/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-doggram-brown-dark/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Caption */}
        <div className="p-4 space-y-4">
          <Textarea
            label="Legenda"
            placeholder="Escreva uma legenda para a foto do seu dog…"
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
            maxChars={MAX_CAPTION_LENGTH}
            rows={4}
          />

          {error && (
            <div className="bg-doggram-error/10 border border-doggram-error/30 rounded-2xl px-4 py-3">
              <p className="text-xs text-doggram-error font-semibold">{error}</p>
            </div>
          )}

          {!profile && (
            <div className="bg-doggram-amber/10 border border-doggram-amber/40 rounded-2xl px-4 py-3">
              <p className="text-xs text-doggram-brown-mid font-semibold">
                Você precisa criar um perfil antes de publicar.
              </p>
            </div>
          )}

          <div className="bg-doggram-cream border border-doggram-border rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-doggram-brown-mid uppercase tracking-wide">Dicas</p>
            <ul className="space-y-1">
              {["Imagens quadradas (1:1) ficam melhor no feed", "Máx. 1 MB — imagens maiores serão comprimidas automaticamente", "Formatos aceitos: JPG, PNG, WebP, HEIC"].map((tip) => (
                <li key={tip} className="text-xs text-doggram-brown-soft flex gap-2">
                  <span className="text-doggram-orange">•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
