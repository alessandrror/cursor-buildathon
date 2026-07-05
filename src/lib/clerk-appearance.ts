import type { Appearance } from "@clerk/types";

/**
 * Apariencia de los componentes de Clerk derivada del design system GhostLine.
 * Los colores referencian los tokens CSS definidos en `globals.css` (una sola
 * fuente de verdad) — así Clerk hereda la paleta y el tema claro/oscuro sin
 * duplicar valores hex. Clerk soporta oficialmente `var(--token)` en `variables`.
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorBackground: "var(--background)",
    colorInputBackground: "var(--card)",
    colorInputText: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--success)",
    colorWarning: "var(--warning)",
    colorNeutral: "var(--foreground)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-hanken), sans-serif",
    fontFamilyButtons: "var(--font-hanken), sans-serif",
  },
  elements: {
    rootBox: "mx-auto",
    modalBackdrop: "bg-foreground/40 backdrop-blur-sm",
    modalContent: "rounded-xl",
    card: "shadow-sm border border-border",
    headerTitle: "font-display font-bold",
    headerSubtitle: "text-muted-foreground",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    footerActionLink: "text-primary hover:text-primary/80",
  },
};
