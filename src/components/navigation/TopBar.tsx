import Link from "next/link";
import { Heart, MessageCircle, Trophy } from "lucide-react";

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-doggram-cream/90 backdrop-blur-md border-b border-doggram-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-1.5 select-none">
          <img src="/doggram-logo.svg" alt="Doggram" className="w-8 h-8" />
          <span
            className="font-black text-transparent bg-clip-text bg-gradient-to-r from-doggram-orange to-doggram-amber"
            style={{ fontSize: 22 }}
          >
            Doggram
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/ranking"
            className="p-2.5 rounded-xl text-doggram-brown-mid hover:text-doggram-amber hover:bg-doggram-amber/10 transition-colors"
            aria-label="Ranking"
          >
            <Trophy size={22} />
          </Link>

          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl text-doggram-brown-mid hover:text-doggram-orange hover:bg-doggram-orange/10 transition-colors"
            aria-label="Notificações"
          >
            <Heart size={22} />
            {/* Unread dot — will be dynamic later */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-doggram-coral rounded-full border border-doggram-cream" />
          </Link>

          <Link
            href="/messages"
            className="p-2.5 rounded-xl text-doggram-brown-mid hover:text-doggram-orange hover:bg-doggram-orange/10 transition-colors"
            aria-label="Mensagens"
          >
            <MessageCircle size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
}
