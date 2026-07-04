export const routes = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  settings: "/settings",
  summaryDetail: (id: string) => `/dashboard/summaries/${id}`,
} as const;

export const statusLabels = {
  completed: "Completada",
  closed_by_silence: "Cerrada por silencio",
  rejected_by_rules: "Rechazada por reglas",
  failed: "Fallida",
} as const;
