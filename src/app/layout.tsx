import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Geist, Geist_Mono } from "next/font/google";

import { SyncClerkUser } from "@/components/auth/sync-clerk-user";
import { syncClerkUserToSupabase } from "@/lib/supabase/sync-clerk-user";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Call Assistant",
  description:
    "Recibe llamadas, filtra conversaciones y obtén resúmenes automáticos usando inteligencia artificial.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (userId) {
    await syncClerkUserToSupabase();
  }

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <SyncClerkUser />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
