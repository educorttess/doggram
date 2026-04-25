import Link from "next/link";

const STATS = [
  { value: "50K+", label: "Dogs" },
  { value: "1M+",  label: "Fotos" },
  { value: "200+", label: "Raças" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-doggram-cream flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[560px] h-[560px] rounded-full bg-doggram-orange/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-doggram-amber/8 blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-56 h-56 rounded-full bg-doggram-coral/6 blur-3xl" />
      </div>

      {/* Floating emojis */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden">
        <span className="absolute top-[14%] left-[7%]  text-3xl opacity-20 animate-float">🐾</span>
        <span className="absolute top-[22%] right-[9%] text-2xl opacity-15 animate-float-delay">🐕</span>
        <span className="absolute top-[55%] left-[4%]  text-2xl opacity-12 animate-float-slow">🦮</span>
        <span className="absolute bottom-[18%] right-[7%] text-3xl opacity-18 animate-float">🐩</span>
        <span className="absolute bottom-[38%] left-[14%] text-xl opacity-10 animate-float-delay">🐶</span>
        <span className="absolute top-[40%] right-[5%]  text-xl opacity-10 animate-float-slow">🦴</span>
      </div>

      <div className="relative text-center max-w-xs w-full">
        {/* Logo */}
        <div className="relative inline-block mb-5">
          <div className="absolute inset-0 rounded-full bg-doggram-orange/20 blur-2xl scale-[2]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/doggram-logo.svg" alt="Doggram" className="relative w-24 h-24 mx-auto drop-shadow-lg" />
        </div>

        <h1
          className="font-black text-transparent bg-clip-text bg-gradient-to-r from-doggram-orange via-doggram-amber to-doggram-orange mb-2"
          style={{ fontSize: 46 }}
        >
          Doggram
        </h1>

        <p className="text-doggram-brown-mid font-semibold text-base mb-1.5">
          A rede social dos melhores amigos
        </p>
        <p className="text-doggram-brown-soft text-sm mb-8 leading-relaxed">
          Compartilhe os momentos do seu dog, siga outros pets e faça parte da maior comunidade canina do Brasil.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-black text-doggram-orange leading-tight">{value}</p>
              <p className="text-xs text-doggram-brown-soft font-semibold">{label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-doggram-orange to-doggram-amber shadow-warm hover:opacity-90 active:scale-[0.98] transition-all duration-200"
          >
            Criar conta grátis
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-doggram-orange border-2 border-doggram-orange/50 hover:bg-doggram-orange/10 hover:border-doggram-orange active:scale-[0.98] transition-all duration-200"
          >
            Já tenho conta
          </Link>
        </div>

        <p className="text-xs text-doggram-brown-soft mt-6 opacity-60">
          🐾 Grátis para sempre
        </p>
      </div>
    </div>
  );
}
