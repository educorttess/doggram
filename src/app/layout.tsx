import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doggram — Rede Social para Cachorros",
  description: "A rede social exclusiva para cachorros. Compartilhe fotos, siga outros dogs e forme uma comunidade canina.",
  icons: {
    icon: "/doggram-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        {/* Apply saved theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('doggram-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
