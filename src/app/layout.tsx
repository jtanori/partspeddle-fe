import type { Metadata } from "next";
import {
  Inter,
  Rajdhani,
  Oswald,
  JetBrains_Mono,
  Inter_Tight,
} from "next/font/google";
import { Providers } from "@/components/Providers";
import { UIOverlays } from "@/components/UIOverlays";
import { AppWrapper } from "@/components/layout/AppWrapper";
import "../index.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-heading-tight",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PartsPeddle | Used OEM Auto Parts Marketplace",
  description:
    "Algolia-powered Search, Supabase Auth, and AI-driven parts identification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${interTight.variable} ${rajdhani.variable} ${oswald.variable} ${mono.variable} antialiased min-h-screen bg-base-cream font-sans text-steel-black`}
      >
        <Providers>
          <AppWrapper>
            <UIOverlays />
            {children}
          </AppWrapper>
        </Providers>
      </body>
    </html>
  );
}
