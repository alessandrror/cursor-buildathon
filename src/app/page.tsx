import Link from "next/link";
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

import { GhostLineLogo, GhostLineMark } from "@/components/brand/ghostline-logo";
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

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="pointer-events-none fixed inset-x-0 top-4 z-50 px-6 lg:px-8">
        <div className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between rounded-full border border-hero-foreground/15 bg-hero/75 px-4 py-3 text-hero-foreground shadow-sm backdrop-blur-xl">
          <GhostLineLogo inverted markClassName="size-9" />
          <nav className="hidden items-center gap-6 text-sm font-medium text-hero-foreground/80 md:flex">
            <a href="#como-funciona" className="hover:text-hero-foreground">
              Cómo funciona
            </a>
            <a href="#confianza" className="hover:text-hero-foreground">
              Confianza
            </a>
            <a href="#dashboard" className="hover:text-hero-foreground">
              Dashboard
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="secondary" size="sm">
              <Link href="/sign-in">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-hero">
        <div className="absolute -right-24 -top-28 hidden opacity-10 lg:block">
          <GhostLineMark className="size-128" inverted />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-14 px-6 pb-10 pt-28 lg:px-8 lg:pb-14 lg:pt-32">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-8 py-10 text-hero-foreground lg:py-16">
              <div className="flex flex-col gap-4">
                <Badge variant="accent" className="uppercase tracking-[0.16em]">
                  Protección activa
                </Badge>
                <h1 className="max-w-3xl font-display text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                  Cuelga las estafas antes de que suene tu teléfono
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-hero-foreground/80 md:text-xl">
                  GhostLine te da un número alternativo que filtra llamadas,
                  conversa cuando hace falta y te deja solo lo importante.
                </p>
              </div>

              <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/sign-in">
                    Crear cuenta y protegerme
                    <UserPlus data-icon="inline-end" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-hero-foreground/30 bg-hero-foreground/5 text-hero-foreground hover:bg-hero-foreground/15 hover:text-hero-foreground"
                >
                  <a href="#como-funciona">Ver cómo funciona</a>
                </Button>
              </div>

              <div className="grid max-w-2xl grid-cols-3 gap-3">
                <Stat value="37" label="bloqueadas este mes" />
                <Stat value="4.2h" label="tiempo recuperado" />
                <Stat value="8.4k" label="personas protegidas" />
              </div>
            </div>

            <PhonePreview />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="uppercase tracking-[0.16em]">
            Problema
          </Badge>
          <h2 className="font-display text-4xl font-black leading-tight">
            No todas las llamadas merecen tu atención
          </h2>
          <p className="text-lg leading-8 text-muted-foreground">
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
        className="border-y border-border bg-muted/55 py-20"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <Badge variant="accent" className="uppercase tracking-[0.16em]">
              Cómo funciona
            </Badge>
            <h2 className="font-display text-4xl font-black leading-tight">
              Un filtro sereno entre cada llamada y tu día
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
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
        className="mx-auto grid max-w-6xl gap-8 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:px-8"
      >
        <div className="flex flex-col gap-5">
          <Badge variant="secondary" className="uppercase tracking-[0.16em]">
            Confianza
          </Badge>
          <h2 className="font-display text-4xl font-black leading-tight">
            Estados claros, sin asustarte
          </h2>
          <p className="text-lg leading-8 text-muted-foreground">
            Cada llamada queda clasificada con un lenguaje que puedes entender:
            seguro, sospechoso o bloqueado. Nada de paneles llenos de ruido.
          </p>
          <p className="font-serif text-2xl italic leading-8 text-primary">
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

      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">
        <div className="grid gap-6 rounded-4xl border border-border bg-card p-6 shadow-sm md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between gap-8 rounded-3xl bg-secondary p-6">
            <div className="flex flex-col gap-4">
              <Badge variant="default" className="uppercase tracking-[0.16em]">
                Registro
              </Badge>
              <h2 className="font-display text-4xl font-black leading-tight">
                Tu primera capa de protección empieza con una cuenta
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Regístrate para guardar tus reglas, activar tu número GhostLine
                y consultar cada llamada filtrada desde tu dashboard privado.
              </p>
            </div>
            <Button asChild size="lg" className="w-fit">
              <Link href="/sign-in">
                Registrarme ahora
                <UserPlus data-icon="inline-end" />
              </Link>
            </Button>
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

      <section id="dashboard" className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-hero p-8 text-hero-foreground shadow-lg md:p-12">
          <div className="absolute -bottom-32 -right-16 opacity-10">
            <GhostLineMark className="size-80" inverted />
          </div>
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.85fr]">
            <div className="flex flex-col gap-5">
              <Badge variant="accent" className="uppercase tracking-[0.16em]">
                Dashboard
              </Badge>
              <h2 className="max-w-2xl font-display text-4xl font-black leading-tight md:text-5xl">
                Tu teléfono se queda en calma. Tú decides con contexto.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-hero-foreground/80">
                Entra para revisar llamadas filtradas, cambiar reglas y leer los
                resúmenes generados después de cada conversación.
              </p>
              <div>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/sign-in">
                    Crear mi cuenta
                    <Sparkles data-icon="inline-end" />
                  </Link>
                </Button>
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
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-semibold">Cuenta</span>
            <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">
              Crear cuenta
            </Link>
            <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">
              Iniciar sesión
            </Link>
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
    <div className="rounded-xl border border-hero-foreground/15 bg-hero-foreground/10 p-4">
      <div className="font-display text-2xl font-black">{value}</div>
      <div className="text-xs leading-5 text-hero-foreground/70">{label}</div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-[2.25rem] bg-foreground p-3 shadow-lg">
      <div className="overflow-hidden rounded-[1.75rem] bg-background">
        <div className="flex items-center justify-between px-5 py-4 text-xs font-semibold text-muted-foreground">
          <span>9:41</span>
          <span>GhostLine</span>
        </div>
        <div className="flex flex-col gap-4 px-5 pb-5">
          <div className="relative overflow-hidden rounded-xl bg-hero p-5 text-hero-foreground">
            <GhostLineMark
              className="absolute -right-8 -top-8 size-32 opacity-15"
              inverted
            />
            <div className="relative flex flex-col gap-4">
              <Badge variant="accent">Protección activa</Badge>
              <div>
                <div className="font-display text-3xl font-black leading-tight">
                  Estás protegido
                </div>
                <p className="font-serif text-lg italic text-hero-foreground/75">
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
            <div className="rounded-lg border border-border bg-card p-4">
              <CheckCircle2 className="size-5 text-success" />
              <p className="mt-3 text-sm font-semibold">Auto-bloqueo</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Estafas conocidas se cuelgan solas.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <PhoneOff className="size-5 text-destructive" />
              <p className="mt-3 text-sm font-semibold">Desconocidos</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Van directo al filtro.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
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
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-bold">{title}</h3>
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
    <Card>
      <CardHeader>
        <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="size-5" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
