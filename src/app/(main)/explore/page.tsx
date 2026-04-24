"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PostWithProfile } from "@/types/post";
import type { Profile } from "@/types/profile";

// Quick-filter breed chips (most common)
const QUICK_BREEDS = [
  "Labrador Retriever",
  "Golden Retriever",
  "Bulldog Francês",
  "Poodle",
  "Husky Siberiano",
  "Border Collie",
  "Shih Tzu",
  "Pug",
  "Sem Raça Definida (SRD)",
];

interface ProfileResult extends Pick<Profile, "id" | "username" | "dog_name" | "breed" | "avatar_url" | "is_verified" | "followers_count"> {}

export default function ExplorePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [breedFilter, setBreedFilter] = useState<string | null>(null);

  // Popular posts grid (loaded once)
  const [allPosts, setAllPosts] = useState<PostWithProfile[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Full search results (debounced)
  const [profileResults, setProfileResults] = useState<ProfileResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Autocomplete suggestions (fast, while typing)
  const [suggestions, setSuggestions] = useState<ProfileResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load popular posts on mount
  useEffect(() => {
    async function fetchPopular() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("posts")
          .select("*, profile:profiles!profile_id(id, username, dog_name, breed, avatar_url, is_verified)")
          .order("likes_count", { ascending: false })
          .limit(60);
        setAllPosts((data ?? []) as PostWithProfile[]);
      } catch {
        // Network error — show empty grid
      } finally {
        setPostsLoading(false);
      }
    }
    fetchPopular();
  }, []);

  // Full search (debounced 350ms)
  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setProfileResults([]); setSearching(false); return; }
    setSearching(true);
    try {
      const supabase = createClient();
      const term = `%${q.trim()}%`;
      const { data } = await supabase
        .from("profiles")
        .select("id, username, dog_name, breed, avatar_url, is_verified, followers_count")
        .or(`username.ilike.${term},dog_name.ilike.${term},breed.ilike.${term}`)
        .order("followers_count", { ascending: false })
        .limit(25);
      setProfileResults((data ?? []) as ProfileResult[]);
    } catch {
      setProfileResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Autocomplete suggestions (fast, 150ms)
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const supabase = createClient();
      const term = `%${q.trim()}%`;
      const { data } = await supabase
        .from("profiles")
        .select("id, username, dog_name, breed, avatar_url, is_verified, followers_count")
        .or(`username.ilike.${term},dog_name.ilike.${term}`)
        .order("followers_count", { ascending: false })
        .limit(5);
      setSuggestions((data ?? []) as ProfileResult[]);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    }
  }, []);

  function handleQueryChange(val: string) {
    setQuery(val);
    setShowSuggestions(false);

    // Fast autocomplete
    if (acDebounceRef.current) clearTimeout(acDebounceRef.current);
    acDebounceRef.current = setTimeout(() => fetchSuggestions(val), 150);

    // Slower full search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  }

  function handleSuggestionClick(username: string) {
    setShowSuggestions(false);
    setQuery("");
    router.push(`/${username}`);
  }

  function clearSearch() {
    setQuery("");
    setProfileResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  const isSearching = query.trim().length > 0;

  // Filter popular posts by selected breed
  const filteredPosts = breedFilter
    ? allPosts.filter((p) => p.profile.breed === breedFilter)
    : allPosts;

  return (
    <div>
      {/* ── Search bar ── */}
      <div className="sticky top-14 z-30 bg-doggram-cream/95 backdrop-blur-md border-b border-doggram-border px-3 pt-2.5 pb-0">
        <div className="relative">
          <div className="flex items-center bg-doggram-warm-white border border-doggram-border rounded-2xl px-3 py-2.5 gap-2 focus-within:border-doggram-orange focus-within:ring-2 focus-within:ring-doggram-orange/20 transition-all">
            <Search size={18} className="text-doggram-brown-soft shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Buscar dogs por nome ou raça…"
              className="flex-1 bg-transparent text-sm text-doggram-brown-dark placeholder:text-doggram-brown-soft outline-none"
            />
            {query && (
              <button onClick={clearSearch} className="text-doggram-brown-soft shrink-0">
                <X size={16} />
              </button>
            )}
            {!query && (
              <SlidersHorizontal size={16} className="text-doggram-brown-soft shrink-0" />
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-doggram-warm-white border border-doggram-border rounded-2xl shadow-warm-md overflow-hidden z-40">
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  onMouseDown={() => handleSuggestionClick(p.username)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-doggram-cream transition-colors text-left"
                >
                  <Avatar src={p.avatar_url} alt={p.dog_name} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-doggram-brown-dark truncate">{p.dog_name}</p>
                    <p className="text-xs text-doggram-brown-soft">@{p.username}{p.breed ? ` · ${p.breed}` : ""}</p>
                  </div>
                  {p.is_verified && <Badge variant="verified">Pro</Badge>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Breed filter chips (only shown when not searching) */}
        {!isSearching && (
          <div className="flex gap-2 py-2.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setBreedFilter(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                breedFilter === null
                  ? "bg-doggram-orange text-white shadow-sm"
                  : "bg-doggram-warm-white border border-doggram-border text-doggram-brown-mid hover:border-doggram-orange/50"
              }`}
            >
              Todas as raças
            </button>
            {QUICK_BREEDS.map((breed) => (
              <button
                key={breed}
                onClick={() => setBreedFilter(breedFilter === breed ? null : breed)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  breedFilter === breed
                    ? "bg-doggram-orange text-white shadow-sm"
                    : "bg-doggram-warm-white border border-doggram-border text-doggram-brown-mid hover:border-doggram-orange/50"
                }`}
              >
                {breed.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Search results ── */}
      {isSearching ? (
        <div>
          {searching ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-doggram-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profileResults.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-base font-bold text-doggram-brown-dark mb-1">Nenhum resultado</p>
              <p className="text-sm text-doggram-brown-soft">Tente buscar por outro nome ou raça.</p>
            </div>
          ) : (
            <div className="divide-y divide-doggram-border">
              {profileResults.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.username}`}
                  className="flex items-center gap-3 px-4 py-3 bg-doggram-warm-white hover:bg-doggram-cream transition-colors"
                >
                  <Avatar src={p.avatar_url} alt={p.dog_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-doggram-brown-dark truncate">{p.dog_name}</span>
                      {p.is_verified && <Badge variant="verified">Pro</Badge>}
                    </div>
                    <p className="text-xs text-doggram-brown-soft">
                      @{p.username}{p.breed ? ` · ${p.breed}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-doggram-brown-soft shrink-0">
                    {p.followers_count.toLocaleString("pt-BR")} seg.
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Popular posts grid ── */
        <>
          <div className="px-4 py-2.5 border-b border-doggram-border bg-doggram-warm-white">
            <p className="text-xs font-bold text-doggram-brown-soft uppercase tracking-wide">
              {breedFilter ? `${breedFilter.split(" ")[0]} · Fotos populares` : "Fotos populares"}
            </p>
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-3 gap-px bg-doggram-border">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-none" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="text-4xl mb-3">📸</p>
              <p className="text-base font-bold text-doggram-brown-dark mb-1">
                {breedFilter ? `Sem fotos de ${breedFilter.split(" ")[0]} ainda` : "Nenhum post ainda"}
              </p>
              <p className="text-sm text-doggram-brown-soft">
                {breedFilter ? "Tente outra raça." : "Seja o primeiro a publicar uma foto!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-px bg-doggram-border">
              {filteredPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className={`relative bg-doggram-border group overflow-hidden ${
                    !breedFilter && i % 7 === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                  style={{ aspectRatio: "1" }}
                >
                  <Image
                    src={post.image_url}
                    alt="Post"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="33vw"
                  />
                  {post.likes_count > 0 && (
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-doggram-brown-dark/50 backdrop-blur-sm rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">❤️ {post.likes_count}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
