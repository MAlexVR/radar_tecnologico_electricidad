import type { Metadata, Viewport } from "next";
import { Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vigilancia Tecnológica CEET — Electricidad: Radar y Mapa de Trayectoria | SENA",
  description:
    "Plataforma de vigilancia científico-tecnológica del área de Electricidad del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET — SENA). Integra el Radar Tecnológico (madurez y adopción de tecnologías) y el Mapa de Trayectoria Tecnológica (evolución de capacidades del centro en el tiempo), para el horizonte 2025-2035.",
  keywords: [
    "radar tecnológico",
    "mapa de trayectoria tecnológica",
    "electricidad",
    "vigilancia tecnológica",
    "prospectiva tecnológica",
    "energías renovables",
    "redes eléctricas",
    "microrredes",
    "SENA",
    "CEET",
    "GICS",
  ],
  authors: [
    { name: "Luz Mayerly Amaya Romero" },
    { name: "Mauricio Alexander Vargas Rodríguez" },
  ],
  icons: {
    icon: "/favicon/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VT CEET",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#39a900",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${workSans.variable} ${jetbrainsMono.variable} font-work-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
