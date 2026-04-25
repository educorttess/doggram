import Link from "next/link";
import { Heart, MessageCircle, Trophy } from "lucide-react";

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-doggram-cream/90 backdrop-blur-xl border-b border-doggram-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-1.5 select-none group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/doggram-logo.svg" alt="Doggram" className="w-8 h-8 transition-transform duration-200 group-active:scale-90" />
          <span
            className="font-black text-transparent bg-clip-text bg-gradient-to-r from-doggram-orange to-doggram-amber"
            style={{ fontSize: 22 }}
          >
            Doggram
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <Link
            href="/ranking"
            className="p-2.5 rounded-xl text-doggram-brown-soft hover:text-doggram-amber hover:bg-doggram-amber/12 active:scale-90 transition-all duration-200"
            aria-label="Ranking"
          >
            <Trophy size={22} />
          </Link>

          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl text-doggram-brown-soft hover:text-doggram-coral hover:bg-doggram-coral/12 active:scale-90 transition-all duration-200"
            aria-label="Notificações"
          >
            <Heart size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-doggram-coral rounded-full border-2 border-doggram-cream" />
          </Link>

          <Link
            href="/messages"
            className="p-2.5 rounded-xl text-doggram-brown-soft hover:text-doggram-orange hover:bg-doggram-orange/12 active:scale-90 transition-all duration-200"
            aria-label="Mensagens"
          >
            <MessageCircle size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
}
