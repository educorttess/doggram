export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-doggram-cream flex flex-col items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-doggram-orange/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-doggram-amber/6 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
