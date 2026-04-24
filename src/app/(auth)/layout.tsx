export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-doggram-cream flex flex-col items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-doggram-orange/8" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-doggram-amber/10" />
      </div>

      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
