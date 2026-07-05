import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#1E4D3B",
    colorText: "#14261F",
    colorBackground: "#FBFAF5",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#14261F",
    borderRadius: "0.75rem",
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
