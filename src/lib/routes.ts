export const routes = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  voiceOnboarding: "/onboarding/voz",
  signUpForVoiceOnboarding: "/sign-up?redirect_url=/onboarding/voz",
  dashboard: "/dashboard",
  dashboardRules: "/dashboard/rules",
  dashboardSimulator: "/dashboard/rules/simulator",
  settings: "/settings",
  callDetail: (id: string) => `/dashboard/calls/${id}`,
  summaryDetail: (id: string) => `/dashboard/summaries/${id}`,
} as const;

export const statusLabels = {
  completed: "Completada",
  closed_by_silence: "Cerrada por silencio",
  rejected_by_rules: "Rechazada por reglas",
  failed: "Fallida",
} as const;
