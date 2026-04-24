import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-doggram-cream">
      <TopBar />

      {/* Content — padded for fixed TopBar (56px) and BottomNav (64px) */}
      <main className="max-w-lg mx-auto pt-14 pb-16">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
