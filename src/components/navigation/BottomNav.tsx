"use client";

import { usePathname } from "next/navigation";
import { NavItem } from "./NavItem";
import { PawIcon } from "@/components/pawmatch/PawIcon";
import {
  Home, Search, PlusSquare, Heart, User,
  Home as HomeFill, Heart as HeartFill,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const is = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-doggram-cream/95 backdrop-blur-xl border-t border-doggram-border safe-area-inset-bottom">
      <div className="max-w-lg mx-auto px-1 h-16 flex items-center">
        <NavItem
          href="/feed"
          label="Início"
          icon={<Home size={22} strokeWidth={1.75} />}
          activeIcon={<HomeFill size={22} strokeWidth={2.5} />}
          active={is("/feed")}
        />
        <NavItem
          href="/explore"
          label="Buscar"
          icon={<Search size={22} strokeWidth={1.75} />}
          active={is("/explore")}
        />
        <NavItem
          href="/create"
          label="Criar"
          icon={<PlusSquare size={24} strokeWidth={2} />}
          special
        />
        <NavItem
          href="/notifications"
          label="Avisos"
          icon={<Heart size={22} strokeWidth={1.75} />}
          activeIcon={<HeartFill size={22} strokeWidth={2.5} className="fill-doggram-coral text-doggram-coral" />}
          active={is("/notifications")}
        />
        <NavItem
          href="/pawmatch"
          label="Match"
          icon={<PawIcon size={21} />}
          activeIcon={<PawIcon size={21} filled />}
          active={is("/pawmatch")}
        />
        <NavItem
          href="/profile"
          label="Perfil"
          icon={<User size={22} strokeWidth={1.75} />}
          active={is("/profile")}
        />
      </div>
    </nav>
  );
}
