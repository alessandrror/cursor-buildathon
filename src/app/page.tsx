import {
  BellRing,
  CheckCircle2,
  Clock3,
  FileText,
  KeyRound,
  type LucideIcon,
  LockKeyhole,
  MailCheck,
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";

import {
  AuthControls,
  ClerkAccountCta,
  ClerkSignInButton,
  ClerkSignUpButton,
} from "@/components/layout/auth-controls";
import { GhostLineLogo, GhostLineMark } from "@/components/brand/ghostline-logo";
import { PricingSection } from "@/components/landing/pricing-section";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const productSteps = [
  {
    title: "Recibe la llamada",
    description:
      "Tu número GhostLine toma la llamada primero y revisa si debe pasar.",
    icon: PhoneCall,
  },
  {
    title: "Filtra con tus reglas",
    description:
      "Bloquea patrones sospechosos, silencios iniciales y números que no reconoces.",
    icon: ShieldCheck,
  },
  {
    title: "Contesta por ti",
    description:
      "Si vale la pena atender, un agente conversa en español y recoge el contexto.",
    icon: BellRing,
  },
  {
    title: "Te deja el resumen",
    description:
      "Lees lo importante en el dashboard, con transcripción y próximos pasos.",
    icon: FileText,
  },
];

const trustSignals = [
  { label: "Seguro", value: "Cliente verificado", variant: "success" as const },
  { label: "Sospechoso", value: "Silencio inicial", variant: "warning" as const },
  {
    label: "Bloqueado",
    value: "Patrón de estafa",
    variant: "destructive" as const,
  },
];

const navAuthButtonClass =
  "h-8 min-h-8 rounded-md border px-3.5 text-xs leading-none";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-50 px-5 pt-5 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-hero-foreground/10 bg-hero/55 px-4 py-2 text-hero-foreground backdrop-blur-md">
          <GhostLineLogo
            inverted
            markClassName="size-6"
            wordmarkClassName="text-sm"
          />
          <nav className="hidden items-center gap-7 text-xs font-medium text-hero-foreground/70 md:flex">
            <a href="#como-funciona" className="hover:text-hero-foreground">
              Cómo funciona
            </a>
            <a href="#confianza" className="hover:text-hero-foreground">
              Confianza
            </a>
            <a href="#dashboard" className="hover:text-hero-foreground">
              Dashboard
            </a>
            <a href="#precios" className="hover:text-hero-foreground">
              Precios
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthControls
              size="sm"
              signInVariant="outline"
              signUpVariant="secondary"
              signInClassName={`hidden sm:inline-flex border-hero-foreground/30 bg-transparent text-hero-foreground hover:bg-hero-foreground/10 hover:text-hero-foreground ${navAuthButtonClass}`}
              signUpClassName={`border-transparent bg-hero-foreground text-hero shadow-sm hover:bg-hero-foreground/90 ${navAuthButtonClass}`}
            />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-hero">
        <div className="absolute -right-24 -top-28 hidden opacity-10 lg:block">
          <GhostLineMark className="size-128" inverted />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col px-5 pb-12 pt-24 sm:px-6 lg:px-8 lg:pb-16 lg:pt-28">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="flex flex-col gap-6 text-hero-foreground">
              <div className="flex flex-col gap-3">
                <Badge variant="accent" className="uppercase tracking-[0.14em]">
                  Protección activa
                </Badge>
                <h1 className="max-w-3xl font-display text-4xl font-black leading-[0.96] tracking-tight sm:text-5xl md:text-6xl">
                  Cuelga las estafas antes de que suene tu teléfono
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-hero-foreground/80 sm:text-base">
                  GhostLine te da un número alternativo que filtra llamadas,
                  conversa cuando hace falta y te deja solo lo importante.
                </p>
              </div>

              <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
                <ClerkSignUpButton
                  size="default"
                  className="border border-transparent bg-hero-foreground text-hero shadow-sm hover:bg-hero-foreground/90"
                >
                  Crear cuenta y protegerme
                  <UserPlus data-icon="inline-end" />
                </ClerkSignUpButton>
                <Button
                  asChild
                  size="default"
                  variant="outline"
                  className="border-hero-foreground/30 bg-transparent text-hero-foreground hover:bg-hero-foreground/10 hover:text-hero-foreground"
                >
                  <a href="#como-funciona">Ver cómo funciona</a>
                </Button>
              </div>

              <div className="grid max-w-2xl grid-cols-3 gap-3 pt-2">
                <Stat value="37" label="bloqueadas este mes" />
                <Stat value="4.2h" label="tiempo recuperado" />
                <Stat value="8.4k" label="personas protegidas" />
              </div>
            </div>

            <PhonePreview />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="uppercase tracking-[0.16em]">
            Problema
          </Badge>
          <h2 className="max-w-md font-display text-3xl font-black leading-tight sm:text-4xl">
            No todas las llamadas merecen tu atención
          </h2>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
            Las estafas no solo interrumpen. También te obligan a decidir rápido.
            GhostLine pone una pausa amable entre tú y la llamada.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            icon={PhoneOff}
            title="Cuelga por ti"
            description="Las llamadas que no pasan tus reglas se cortan sin pedirte atención."
          />
          <InsightCard
            icon={LockKeyhole}
            title="Protege tu número"
            description="Compartes un número alternativo y mantienes tu línea personal tranquila."
          />
          <InsightCard
            icon={Clock3}
            title="Resume lo útil"
            description="Cuando una llamada sí importa, recibes contexto claro para decidir."
          />
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-y border-border bg-muted/55 py-16"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-9 px-5 sm:px-6 lg:px-8">
          <div className="flex max-w-3xl flex-col gap-3">
            <Badge variant="accent" className="uppercase tracking-[0.16em]">
              Cómo funciona
            </Badge>
            <h2 className="font-display text-3xl font-black leading-tight sm:text-4xl">
              Un filtro sereno entre cada llamada y tu día
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              La experiencia es simple para ti, aunque por detrás conecte
              telefonía, reglas, voz y resumen en un solo flujo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {productSteps.map((step) => (
              <Card key={step.title}>
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                    <step.icon className="size-5" />
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="confianza"
        className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8"
      >
        <div className="flex flex-col gap-5">
          <Badge variant="secondary" className="uppercase tracking-[0.16em]">
            Confianza
          </Badge>
          <h2 className="font-display text-3xl font-black leading-tight sm:text-4xl">
            Estados claros, sin asustarte
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Cada llamada queda clasificada con un lenguaje que puedes entender:
            seguro, sospechoso o bloqueado. Nada de paneles llenos de ruido.
          </p>
          <p className="font-serif text-xl italic leading-7 text-primary sm:text-2xl">
            calma natural que protege sin alarmar
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Registro reciente</CardTitle>
            <CardDescription>
              Una vista limpia para saber qué pasó y qué necesitas hacer.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {trustSignals.map((signal) => (
              <div
                key={signal.label}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{signal.value}</span>
                  <span className="text-sm text-muted-foreground">
                    Clasificación automática
                  </span>
                </div>
                <Badge variant={signal.variant}>{signal.label}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-4xl border border-border bg-card p-5 shadow-sm md:p-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between gap-8 rounded-3xl bg-secondary p-6">
            <div className="flex flex-col gap-4">
              <Badge variant="default" className="uppercase tracking-[0.16em]">
                Registro
              </Badge>
              <h2 className="font-display text-3xl font-black leading-tight sm:text-4xl">
                Tu primera capa de protección empieza con una cuenta
              </h2>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                Regístrate para guardar tus reglas, activar tu número GhostLine
                y consultar cada llamada filtrada desde tu dashboard privado.
              </p>
            </div>
            <ClerkSignUpButton size="lg" className="w-fit">
              Registrarme ahora
              <UserPlus data-icon="inline-end" />
            </ClerkSignUpButton>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            <RegistrationStep
              icon={UserPlus}
              title="Crea tu cuenta"
              description="Empieza con Google o correo. GhostLine prepara tu perfil para que no pierdas tus reglas."
            />
            <RegistrationStep
              icon={KeyRound}
              title="Activa tu número"
              description="Después del registro vas al onboarding para conectar el número que filtrará las llamadas."
            />
            <RegistrationStep
              icon={MailCheck}
              title="Recibe contexto"
              description="Cada llamada procesada queda asociada a tu cuenta con resumen, estado y próximos pasos."
            />
          </div>
        </div>
      </section>

      <section id="dashboard" className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-hero p-8 text-hero-foreground shadow-lg md:p-12">
          <div className="absolute -bottom-32 -right-16 opacity-10">
            <GhostLineMark className="size-80" inverted />
          </div>
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.85fr]">
            <div className="flex flex-col gap-5">
              <Badge variant="accent" className="uppercase tracking-[0.16em]">
                Dashboard
              </Badge>
              <h2 className="max-w-2xl font-display text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Tu teléfono se queda en calma. Tú decides con contexto.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-hero-foreground/80 sm:text-base">
                Entra para revisar llamadas filtradas, cambiar reglas y leer los
                resúmenes generados después de cada conversación.
              </p>
              <div>
                <ClerkAccountCta
                  size="lg"
                  variant="secondary"
                  signedInLabel="Ir al dashboard"
                  signedInClassName="border border-transparent bg-hero-foreground text-hero shadow-sm hover:bg-hero-foreground/90"
                >
                  Crear mi cuenta
                  <Sparkles data-icon="inline-end" />
                </ClerkAccountCta>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border border-hero-foreground/15 bg-hero-foreground/10 p-4 backdrop-blur">
              <DashboardRow
                title="Llamada bloqueada"
                description="Patrón de estafa detectado"
                badge="Bloqueado"
              />
              <DashboardRow
                title="Resumen listo"
                description="Proveedor confirmó la cita"
                badge="Seguro"
              />
              <DashboardRow
                title="Regla sugerida"
                description="Silenciar llamadas sin voz inicial"
                badge="Sugerencia"
              />
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <footer className="border-t border-border bg-muted/45">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div className="flex flex-col gap-4">
            <GhostLineLogo markClassName="size-9" />
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              GhostLine protege tu atención con un filtro de llamadas sereno,
              privado y fácil de activar.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-semibold">Producto</span>
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground">
              Cómo funciona
            </a>
            <a href="#confianza" className="text-muted-foreground hover:text-foreground">
              Confianza
            </a>
            <a href="#dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </a>
            <a href="#precios" className="text-muted-foreground hover:text-foreground">
              Precios
            </a>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-semibold">Cuenta</span>
            <ClerkSignUpButton
              variant="link"
              className="h-auto justify-start p-0 text-muted-foreground hover:text-foreground"
            >
              Crear cuenta
            </ClerkSignUpButton>
            <ClerkSignInButton
              variant="link"
              className="h-auto justify-start p-0 text-muted-foreground hover:text-foreground"
            >
              Iniciar sesión
            </ClerkSignInButton>
          </div>
        </div>
        <div className="border-t border-border px-6 py-4">
          <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
            © 2026 GhostLine. Cuelga las estafas sin perder la calma.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-hero-foreground/15 bg-hero-foreground/10 px-4 py-3">
      <div className="font-display text-2xl font-black leading-none">{value}</div>
      <div className="mt-1 text-xs leading-4 text-hero-foreground/70">{label}</div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="mx-auto w-full max-w-xs rounded-4xl bg-foreground p-2.5 shadow-lg lg:mr-0">
      <div className="overflow-hidden rounded-[1.55rem] bg-background">
        <div className="flex items-center justify-between px-4 py-3 text-[0.68rem] font-semibold text-muted-foreground">
          <span>9:41</span>
          <span>GhostLine</span>
        </div>
        <div className="flex flex-col gap-3 px-4 pb-4">
          <div className="relative overflow-hidden rounded-xl bg-hero p-4 text-hero-foreground">
            <GhostLineMark
              className="absolute -right-8 -top-8 size-28 opacity-15"
              inverted
            />
            <div className="relative flex flex-col gap-3">
              <Badge variant="accent">Protección activa</Badge>
              <div>
                <div className="font-display text-2xl font-black leading-tight">
                  Estás protegido
                </div>
                <p className="font-serif text-base italic text-hero-foreground/75">
                  sin alarmas, sin interrupciones
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniMetric value="37" label="bloqueadas" />
                <MiniMetric value="4.2h" label="ahorradas" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <CheckCircle2 className="size-5 text-success" />
              <p className="mt-2 text-sm font-semibold">Auto-bloqueo</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Estafas conocidas se cuelgan solas.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <PhoneOff className="size-5 text-destructive" />
              <p className="mt-2 text-sm font-semibold">Desconocidos</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Van directo al filtro.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Llamada sospechosa</p>
                <p className="text-xs text-muted-foreground">
                  Silencio inicial detectado
                </p>
              </div>
              <Badge variant="warning">Revisar</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-hero-foreground/10 p-3">
      <div className="font-display text-xl font-black">{value}</div>
      <div className="text-xs text-hero-foreground/70">{label}</div>
    </div>
  );
}

function RegistrationStep({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-background p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-bold">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof PhoneOff;
  title: string;
  description: string;
}) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="size-5" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="leading-6">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function DashboardRow({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-hero-foreground/10 p-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-sm text-hero-foreground/70">{description}</span>
      </div>
      <span className="rounded-full bg-hero-foreground/15 px-3 py-1 text-xs font-semibold">
        {badge}
      </span>
    </div>
  );
}
