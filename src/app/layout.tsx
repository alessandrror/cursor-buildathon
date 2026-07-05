import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  Hanken_Grotesk,
  Newsreader,
  Schibsted_Grotesk,
} from "next/font/google";

import { SyncClerkUser } from "@/components/auth/sync-clerk-user";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { routes } from "@/lib/routes";
import { syncClerkUserToSupabase } from "@/lib/supabase/sync-clerk-user";

import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "GhostLine | Cuelga las estafas",
  description:
    "GhostLine filtra llamadas de estafa, deja pasar lo importante y te entrega resúmenes claros en español.",
};

const themeScript = `
  (function () {
    var storageKey = "ghostline-theme";

    function getStoredTheme() {
      try {
        return window.localStorage.getItem(storageKey);
      } catch (_) {
        return null;
      }
    }

    function setStoredTheme(theme) {
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch (_) {}
    }

    function syncToggle(isDark) {
      var toggles = document.querySelectorAll("[data-theme-toggle]");
      toggles.forEach(function (toggle) {
        toggle.setAttribute("aria-pressed", String(isDark));
        toggle.setAttribute(
          "aria-label",
          isDark ? "Cambiar a modo día" : "Cambiar a modo noche"
        );
      });
    }

    function applyTheme(theme) {
      var isDark = theme === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      syncToggle(isDark);
    }

    var storedTheme = getStoredTheme();
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(storedTheme || (prefersDark ? "dark" : "light"));

    document.addEventListener("click", function (event) {
      var toggle = event.target.closest("[data-theme-toggle]");
      if (!toggle) return;

      var nextTheme = document.documentElement.classList.contains("dark")
        ? "light"
        : "dark";

      applyTheme(nextTheme);
      setStoredTheme(nextTheme);
    });

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        syncToggle(document.documentElement.classList.contains("dark"));
      });
    } else {
      syncToggle(document.documentElement.classList.contains("dark"));
    }
  })();
`;

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
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl={routes.signIn}
      signUpUrl={routes.signUp}
      signInFallbackRedirectUrl={routes.dashboard}
      signUpFallbackRedirectUrl={routes.voiceOnboarding}
      signUpForceRedirectUrl={routes.voiceOnboarding}
    >
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${hanken.variable} ${schibsted.variable} ${newsreader.variable} antialiased`}
        >
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          <SyncClerkUser />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
