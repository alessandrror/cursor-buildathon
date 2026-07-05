# GhostLine — Design System

**GhostLine** es una aplicación web y móvil que protege a las personas de las llamadas de estafa: detecta y bloquea números fraudulentos antes de que suene el teléfono. La marca debe transmitir **confianza, seguridad, calidez y cercanía** — protección que se siente humana, nunca alarmista.

Este sistema de diseño se deriva de la dirección de marca **"Guardián Sereno"** (opción 1b de la exploración inicial): una identidad de calma natural, apoyada en verdes profundos, con un fantasma amigable (solo ojos) como mascota.

> Nota de alcance: este design system es una referencia de estilo visual. No asume nada sobre el usuario más allá de lo que se pidió: branding para GhostLine.

---

## Fundamentos de contenido (Content fundamentals)

- **Idioma:** español (es-SV / neutro).
- **Voz:** cercana, tranquila y clara. Hablamos **de "tú"** al usuario. Nunca técnica ni alarmista: la app da calma, no miedo.
- **Tono:** protector y humano. Frases cortas, verbos de acción. Ej.: *"Estás protegido"*, *"GhostLine puede colgar por ti"*, *"Cuelga las estafas"*.
- **Acento editorial:** lemas y frases de apoyo en **Newsreader itálica**, en minúsculas, tono íntimo: *"calma natural que protege sin alarmar"*.
- **Mayúsculas:** títulos en sentence case (no Title Case). Etiquetas/eyebrows en MAYÚSCULAS con tracking amplio (0.16em).
- **Números y estadísticas:** solo cuando aportan tranquilidad o prueba social (ej. "37 bloqueadas este mes", "8.400 personas protegidas"). Evitar data slop.
- **Emoji:** no se usan. La iconografía es Lucide.

## Fundamentos visuales (Visual foundations)

- **Color:** base verde. **Pino `#1E4D3B`** (primario), **Salvia `#8FB09B`** (secundario/anillo de foco), **Arena `#E8C98E`** (acento cálido), **Hueso `#F5F3EC`** y **Paper `#FBFAF5`** (superficies), **Bosque `#14261F`** (tinta/profundo). Estados: Bloqueado `#C0503B`, Seguro `#2F7D57`, Sospechoso `#C68A2E`. **No** usar azules/violetas tipo IA.
- **Tipografía:** **Schibsted Grotesk** (títulos, 700/900, tracking −0.02em) · **Hanken Grotesk** (UI y cuerpo, 400/500/600) · **Newsreader** itálica (acentos editoriales).
- **Radios:** suaves y amigables, nunca en punta. Base `--radius: 1rem`. Tarjetas `rounded-xl` (1.25rem), botones/inputs `rounded-md`, chips/badges/toggles pill.
- **Sombras:** suaves y **tintadas de verde** (no gris neutro). `--shadow-sm/md/lg`. Elevación baja; las tarjetas usan borde sutil `#E7E4DA` + sombra sm.
- **Superficies/fondos:** planas y cálidas. Fondo de app Paper. Héroes sobre Pino con una silueta de fantasma a muy baja opacidad (~8–12%) como textura. Sin gradientes agresivos.
- **Movimiento:** gentil y tranquilizador. Duración 140–360ms, easing `cubic-bezier(0.2,0.7,0.3,1)`. Nada de rebotes ni animaciones alarmantes.
- **Estados hover:** oscurecer el relleno (`/90`, `/80`) o teñir con Salvia 100. **Press:** desplazar 1px hacia abajo (`translate-y-px`). **Focus:** anillo Salvia de 3px.
- **Bordes:** 1px `#E7E4DA` (subtle) / `#CBD3CB` (strong).
- **Layout:** contenedor 1120px, gutter 24px, grid base 4px.

## Iconografía

- **Sistema:** [Lucide](https://lucide.dev) (stroke, 2px, redondeado) — coincide con la calidez y suavidad de la marca. En la app se carga por CDN (`unpkg.com/lucide`). En un proyecto shadcn se usa `lucide-react`.
- **Marca / mascota:** fantasma geométrico **solo con ojos** (sin sonrisa), en `assets/`. Variantes: positivo (Pino), negativo (Hueso), contorno (mono). No redibujar el fantasma a mano en cada uso — usar los SVG provistos.
- **Emoji / unicode como íconos:** no.

---

## Integración con shadcn/ui + Tailwind v4

El equipo usa **shadcn/ui + Tailwind v4**. Ver la carpeta **`shadcn/`**:
- `shadcn/globals.css` — tokens GhostLine en formato de variables shadcn, tema claro **y oscuro**, con `@theme inline` (no requiere `tailwind.config.js`).
- `shadcn/components/ui/` — `button`, `badge`, `card`, `input`, `label`, `switch` reestilizados vía variables (sin colores hard-coded).
- `shadcn/lib/utils.ts` — helper `cn`.
- `shadcn/README.md` — pasos de instalación y mapeo marca → variable.

---

## Índice / manifiesto

- **`styles.css`** — entrada global del design system (solo `@import`).
- **`tokens/`** — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `fonts.css`.
- **`assets/`** — `ghostline-mark.svg`, `ghostline-mark-bone.svg`, `ghostline-mark-outline.svg`.
- **`guidelines/`** — especímenes (color, tipo, espacio, elevación, marca) que pueblan la pestaña Design System.
- **`components/`** — previews de componentes (Button, Badge, Card, Form) con Tailwind + tokens.
- **`shadcn/`** — paquete de integración shadcn/ui (fuente para el código real).
- **`ui_kits/app/`** — recreación interactiva de la app GhostLine (home de protección + pantalla de llamada entrante).
- **`GhostLine Branding.dc.html`** — tablero original de exploración con las 3 direcciones.
- **`SKILL.md`** — para usar este sistema como Agent Skill.

## Fuentes de esta identidad

Creada desde cero (no había codebase ni Figma). Dirección elegida por el usuario: **1b "Guardián Sereno"**, con la mascota fantasma de la 1c (solo ojos, sin sonrisa, sin arcos de llamada).
