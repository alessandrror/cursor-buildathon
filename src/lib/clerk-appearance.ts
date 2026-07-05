import type { Appearance } from "@clerk/types";

/**
 * Apariencia de los componentes de Clerk derivada del design system GhostLine.
 * Referencia visual: `specs/design/frames/02-registro.png` y `04-iniciar-sesion.png`.
 *
 * Los colores referencian los tokens CSS definidos en `globals.css` (una sola
 * fuente de verdad) — así Clerk hereda la paleta y el tema claro/oscuro sin
 * duplicar valores hex. Clerk soporta oficialmente `var(--token)` en `variables`.
 */
export const clerkAppearance: Appearance = {
  layout: {
    logoImageUrl: "/brand/ghostline-mark.svg",
    logoPlacement: "inside",
    socialButtonsVariant: "blockButton",
    socialButtonsPlacement: "top",
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorForeground: "var(--foreground)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorBackground: "var(--card)",
    colorInput: "var(--card)",
    colorInputForeground: "var(--foreground)",
    colorBorder: "var(--border)",
    colorRing: "var(--ring)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--success)",
    colorWarning: "var(--warning)",
    colorNeutral: "var(--foreground)",
    // Aliases deprecados — Clerk v6 aún los consume en algunos subcomponentes.
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorInputBackground: "var(--card)",
    colorInputText: "var(--foreground)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-hanken), sans-serif",
    fontFamilyButtons: "var(--font-hanken), sans-serif",
    spacing: "1rem",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-md",
    card: "bg-card shadow-sm border border-border rounded-xl",
    main: "gap-6",
    logoBox: "justify-center",
    logoImage: "h-10 w-10",
    headerTitle: "font-display text-2xl font-bold text-foreground",
    headerSubtitle: "text-sm text-muted-foreground",
    socialButtonsBlockButton:
      "bg-card text-foreground border border-border shadow-none hover:bg-muted",
    // El diseño solo contempla Google; GitHub sigue habilitado en Clerk Dashboard.
    socialButtonsBlockButton__github: "hidden",
    socialButtonsIconButton__github: "hidden",
    socialButtonsBlockButtonText: "font-medium text-foreground",
    dividerLine: "bg-border",
    dividerText: "bg-card text-muted-foreground",
    formFieldLabel: "text-sm font-semibold text-foreground",
    formFieldInput:
      "bg-card border-border text-foreground shadow-none focus:ring-ring",
    formButtonPrimary:
      "bg-primary text-primary-foreground shadow-sm font-semibold hover:bg-primary/90",
    footerActionText: "text-muted-foreground",
    footerActionLink: "font-semibold text-primary hover:text-primary/80",
    identityPreviewText: "text-foreground",
    formFieldInputShowPasswordButton: "text-muted-foreground",
    alertText: "text-foreground",
    modalBackdrop: "bg-foreground/40 backdrop-blur-sm",
    modalContent: "rounded-xl",
  },
};
