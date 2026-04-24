import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-doggram-cream flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[min(500px,90vw)] h-[min(500px,90vw)] rounded-full bg-doggram-orange/10" />
        <div className="absolute -bottom-32 -left-32 w-[min(400px,80vw)] h-[min(400px,80vw)] rounded-full bg-doggram-amber/12" />
      </div>

      <div className="relative text-center max-w-xs">
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/doggram-logo.svg" alt="Doggram" className="w-28 h-28 mx-auto mb-5 drop-shadow-sm" />
        <h1
          className="font-black text-transparent bg-clip-text bg-gradient-to-r from-doggram-orange to-doggram-amber mb-2"
          style={{ fontSize: 42 }}
        >
          Doggram
        </h1>
        <p className="text-doggram-brown-mid font-semibold text-base mb-2">
          A rede social dos melhores amigos
        </p>
        <p className="text-doggram-brown-soft text-sm mb-10 leading-relaxed">
          Compartilhe os momentos do seu dog, siga outros pets e faça parte da maior comunidade canina do Brasil.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-doggram-orange to-doggram-amber shadow-warm hover:opacity-90 transition-opacity"
          >
            Criar conta grátis
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-doggram-orange border-2 border-doggram-orange hover:bg-doggram-orange/8 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>

      </div>
    </div>
  );
}
