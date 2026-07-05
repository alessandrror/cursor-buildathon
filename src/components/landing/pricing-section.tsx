"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Check, Loader2, MailCheck, ShieldCheck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  price: string;
  per?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    name: "Pro",
    price: "$4.99",
    per: "/mes",
    description: "Protección personal con agente de IA.",
    features: [
      "Número GhostLine alternativo",
      "Filtrado por tus reglas",
      "El agente contesta por ti",
      "Resúmenes con conclusión",
      "Listas y prefijos ilimitados",
    ],
    cta: "Empezar con Pro",
  },
  {
    name: "Business",
    price: "$12.99",
    per: "/mes",
    description: "Para familias y equipos pequeños.",
    features: [
      "Todo lo de Pro",
      "Responde con tu voz clonada",
      "Hasta 5 números",
      "Panel compartido y roles",
    ],
    cta: "Elegir Business",
  },
  {
    name: "Premium",
    price: "$24.99",
    per: "/mes",
    description: "Máxima protección e inteligencia.",
    features: [
      "Todo lo de Business",
      "IA nivel «detective»",
      "Análisis y alertas avanzadas",
      "Soporte prioritario 24/7",
    ],
    cta: "Ir a Premium",
    highlighted: true,
    badge: "Más completo",
  },
];

export function PricingSection() {
  const [selected, setSelected] = useState<Plan | null>(null);

  return (
    <section id="precios" className="bg-background py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-9 px-5 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <Badge variant="accent" className="uppercase tracking-[0.16em]">
            Precios
          </Badge>
          <h2 className="font-display text-3xl font-black leading-tight sm:text-4xl">
            Un plan para cada nivel de protección
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Empieza cuando quieras y sube de plan cuando lo necesites. Sin
            permanencia.
          </p>
        </div>

        <div className="grid w-full gap-5 md:grid-cols-3 md:items-stretch">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              onSelect={() => setSelected(plan)}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Precios de referencia · sin permanencia · cancela cuando quieras.
        </p>
      </div>

      {selected && (
        <SalesModal plan={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function PricingCard({
  plan,
  onSelect,
}: {
  plan: Plan;
  onSelect: () => void;
}) {
  const hero = plan.highlighted;
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-3xl p-7",
        hero
          ? "bg-hero text-hero-foreground shadow-lg"
          : "border border-border bg-card"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-semibold">{plan.name}</span>
        {plan.badge && <Badge variant="accent">{plan.badge}</Badge>}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-black leading-none">
          {plan.price}
        </span>
        {plan.per && (
          <span
            className={cn(
              "text-sm",
              hero ? "text-hero-foreground/75" : "text-muted-foreground"
            )}
          >
            {plan.per}
          </span>
        )}
      </div>

      <p
        className={cn(
          "text-sm leading-6",
          hero ? "text-hero-foreground/75" : "text-muted-foreground"
        )}
      >
        {plan.description}
      </p>

      <div
        className={cn(
          "h-px w-full",
          hero ? "bg-hero-foreground/20" : "bg-border"
        )}
      />

      <ul className="flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                hero ? "text-primary" : "text-success"
              )}
            />
            <span className="leading-6">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        size="lg"
        variant={hero ? "secondary" : "outline"}
        className={cn(
          "w-full",
          hero &&
            "border-transparent bg-hero-foreground text-hero hover:bg-hero-foreground/90"
        )}
      >
        {plan.cta}
      </Button>
    </div>
  );
}

function SalesModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const { isSignedIn, user } = useUser();
  const name =
    user?.firstName ??
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    null;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isSignedIn ? true : emailValid;

  // Cerrar con Escape y bloquear scroll del fondo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function handleSubmit() {
    if (!canSubmit || loading) return;
    setLoading(true);
    // TODO: enviar el lead al backend (nombre/correo + plan de interés).
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-hero/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Contacto para el plan ${plan.name}`}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
        >
          <X className="size-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
              <MailCheck className="size-8" />
            </div>
            <h3 className="font-display text-2xl font-black">
              ¡Gracias{name ? `, ${name}` : ""}!
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Un equipo de ventas se pondrá en contacto contigo muy pronto para
              activar el plan <span className="font-semibold">{plan.name}</span>.
            </p>
            <Button onClick={onClose} size="lg" className="w-full">
              Entendido
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <ShieldCheck className="size-6" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-2xl font-black leading-tight">
                Plan {plan.name}
              </h3>
              {isSignedIn ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Hola <span className="font-semibold text-foreground">{name}</span>
                  , confirma tu interés y un equipo de ventas se pondrá en
                  contacto contigo para activar tu plan {plan.name}.
                </p>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Déjanos tu correo y un equipo de ventas se pondrá en contacto
                  contigo para ayudarte con el plan {plan.name}.
                </p>
              )}
            </div>

            {!isSignedIn && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sales-email">Correo electrónico</Label>
                <Input
                  id="sales-email"
                  type="email"
                  inputMode="email"
                  autoFocus
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full"
              disabled={!canSubmit || loading}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Solicitar contacto
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Sin compromiso. Solo usamos tus datos para contactarte sobre el
              plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
