# Especificación frontend MVP — Web App de llamadas con IA

## 1. Objetivo del frontend

Crear una web app MVP usando **Next.js**, **shadcn/ui** y **Clerk** que permita:

1. Mostrar una landing page pública del producto.
2. Permitir registro e inicio de sesión mediante Clerk.
3. Mostrar un dashboard autenticado con los resúmenes de llamadas.
4. Mostrar una vista de detalle para cada resumen.
5. Mostrar una sección de configuración de cuenta y preferencias generales.
6. Preparar la estructura visual para futuras integraciones con Twilio, ElevenLabs, n8n y Supabase, sin implementar todavía configuraciones avanzadas de esas APIs.

---

## 2. Stack definido

### Frontend

- Next.js
- React
- shadcn/ui
- Tailwind CSS
- Clerk para autenticación

### Servicios externos considerados para el producto

- Twilio
- ElevenLabs
- n8n
- Supabase

Para este MVP frontend, estas integraciones solo deben representarse a nivel visual o estructural cuando sea necesario. No se deben implementar flujos reales todavía, salvo que se indique en una especificación posterior.

---

## 3. Referencias técnicas base

La app debe construirse preferiblemente con **Next.js App Router**, ya que Next.js documenta el uso de carpetas y archivos para definir rutas, layouts y páginas dentro del directorio `app`.

shadcn/ui cuenta con guía oficial para instalación en Next.js y recomienda tener Tailwind CSS e import aliases configurados cuando se usa en una app personalizada.

Clerk ofrece integración oficial con Next.js mediante `clerkMiddleware()` para acceder al estado de autenticación y proteger rutas.

Supabase tiene documentación oficial para usarlo con Next.js, pero en esta primera especificación solo se contempla como servicio futuro de persistencia, no como implementación obligatoria del frontend MVP.

---

## 4. Alcance del MVP frontend

### Incluido

El MVP debe incluir:

1. Landing page pública.
2. Página de inicio de sesión.
3. Página de registro.
4. Layout autenticado para dashboard.
5. Dashboard principal con listado de resúmenes de llamadas.
6. Vista de detalle de resumen.
7. Vista de configuración básica.
8. Navegación principal.
9. Componentes reutilizables con shadcn/ui.
10. Estados visuales de carga, vacío y error.
11. Datos mock para llamadas y resúmenes mientras no exista backend conectado.

### No incluido en esta primera versión

No implementar todavía:

1. Compra o asignación real de números Twilio.
2. Configuración real de Twilio.
3. Configuración real de ElevenLabs.
4. Configuración real de flujos n8n.
5. Configuración real de Supabase.
6. Webhooks reales.
7. Grabación o transcripción real de llamadas.
8. Generación real de resúmenes por IA.
9. Facturación.
10. Roles avanzados.
11. Panel administrativo interno.

---

## 5. Páginas principales

## 5.1 Landing page

Ruta propuesta:

```txt
/
```

Objetivo:

Presentar el producto, explicar el valor principal y llevar al usuario al registro o inicio de sesión.

Secciones mínimas:

1. Hero principal.
2. Explicación breve del problema.
3. Explicación breve de la solución.
4. Cómo funciona en 3 pasos.
5. Beneficios principales.
6. CTA para registrarse.
7. Footer simple.

Contenido sugerido:

- Título principal: “Tu número alternativo atendido por IA”
- Subtítulo: “Recibe llamadas, filtra conversaciones y obtén resúmenes automáticos usando inteligencia artificial.”
- CTA principal: “Crear cuenta”
- CTA secundario: “Iniciar sesión”

Componentes sugeridos:

- `Button`
- `Card`
- `Badge`
- `Separator`
- `Accordion`, si se agrega una sección de preguntas frecuentes
- `NavigationMenu` o navbar simple

---

## 5.2 Registro

Ruta propuesta:

```txt
/sign-up
```

Objetivo:

Permitir al usuario crear una cuenta usando Clerk.

Requisitos:

1. Usar componentes de Clerk para registro.
2. Mantener el diseño visual consistente con la landing.
3. Redirigir al dashboard después del registro exitoso.
4. No crear todavía lógica personalizada de onboarding.

Estado posterior esperado:

```txt
/dashboard
```

---

## 5.3 Inicio de sesión

Ruta propuesta:

```txt
/sign-in
```

Objetivo:

Permitir al usuario iniciar sesión usando Clerk.

Requisitos:

1. Usar componentes de Clerk para login.
2. Mantener diseño visual consistente con la landing.
3. Redirigir al dashboard después del inicio de sesión exitoso.

Estado posterior esperado:

```txt
/dashboard
```

---

## 5.4 Dashboard

Ruta propuesta:

```txt
/dashboard
```

Objetivo:

Mostrar un resumen general de la actividad de llamadas y el listado de resúmenes generados.

Contenido mínimo:

1. Encabezado con saludo al usuario.
2. Tarjetas de métricas generales.
3. Listado de llamadas/resúmenes recientes.
4. Estado vacío si no hay llamadas.
5. Acceso a detalle de resumen.
6. Acceso a configuración.

Métricas visuales sugeridas para el MVP:

- Total de llamadas recibidas.
- Total de llamadas resumidas.
- Llamadas cerradas por silencio.
- Última llamada procesada.

Importante:

Estas métricas deben usar datos mock en esta primera versión.

No asumir todavía:

- Que existe una base de datos conectada.
- Que existe un sistema real de procesamiento de llamadas.
- Que los resúmenes ya vienen de IA real.

Componentes sugeridos:

- `Card`
- `Table`
- `Badge`
- `Button`
- `DropdownMenu`
- `Skeleton`
- `EmptyState` personalizado
- `ScrollArea`

---

## 5.5 Detalle de resumen

Ruta propuesta:

```txt
/dashboard/summaries/[id]
```

Objetivo:

Mostrar el detalle de una llamada procesada.

Contenido mínimo:

1. Título del resumen.
2. Fecha y hora de la llamada.
3. Número entrante.
4. Estado de la llamada.
5. Duración.
6. Motivo de cierre, si aplica.
7. Resumen generado.
8. Sección opcional de transcripción mock.
9. Botón para volver al dashboard.

Estados posibles de llamada:

```txt
completed
closed_by_silence
rejected_by_rules
failed
```

Los nombres pueden ajustarse luego según el backend.

Componentes sugeridos:

- `Card`
- `Badge`
- `Button`
- `Separator`
- `Textarea` o bloque de texto solo lectura
- `Breadcrumb`

---

## 5.6 Configuración

Ruta propuesta:

```txt
/settings
```

Objetivo:

Mostrar una vista de configuración básica para cuenta, preferencias y futuras integraciones.

Contenido del MVP:

1. Sección de cuenta.
2. Sección de preferencias generales.
3. Sección visual de integraciones futuras.
4. Estado de conexión visual para Twilio, ElevenLabs, n8n y Supabase.

Importante:

En esta primera versión, no se deben implementar formularios reales para cambiar claves, tokens, webhooks o credenciales.

La vista solo debe preparar la estructura para futuras configuraciones.

Secciones sugeridas:

### Cuenta

- Nombre del usuario.
- Correo.
- Estado de sesión.
- Acceso al perfil gestionado por Clerk.

### Preferencias

- Idioma del agente: español.
- Preferencia visual: tema claro/oscuro si se decide incluir.
- Notificaciones: placeholder visual.

### Integraciones

Mostrar tarjetas para:

- Twilio
- ElevenLabs
- n8n
- Supabase

Cada tarjeta puede tener:

- Nombre del servicio.
- Breve descripción.
- Estado visual: “Pendiente de configurar”.
- Botón deshabilitado o texto “Disponible próximamente”.

No implementar todavía:

- Inputs de API keys.
- Guardado de credenciales.
- Validación de conexión.
- Pruebas de webhook.
- Sincronización real.

Componentes sugeridos:

- `Tabs`
- `Card`
- `Button`
- `Badge`
- `Switch`
- `Label`
- `Separator`
- `Alert`

---

## 6. Layouts

## 6.1 Layout público

Aplica a:

```txt
/
sign-in
sign-up
```

Debe incluir:

1. Navbar pública.
2. Logo o nombre de la app.
3. CTA de inicio de sesión o registro.
4. Footer básico.

---

## 6.2 Layout autenticado

Aplica a:

```txt
/dashboard
/dashboard/summaries/[id]
/settings
```

Debe incluir:

1. Sidebar o navegación lateral.
2. Header superior.
3. Información del usuario autenticado.
4. Botón o menú de cuenta de Clerk.
5. Navegación hacia dashboard y configuración.
6. Contenedor principal de contenido.

Navegación mínima:

```txt
Dashboard
Configuración
```

---

## 7. Estructura de rutas propuesta

```txt
app/
  layout.tsx
  page.tsx

  sign-in/
    [[...sign-in]]/
      page.tsx

  sign-up/
    [[...sign-up]]/
      page.tsx

  dashboard/
    layout.tsx
    page.tsx
    summaries/
      [id]/
        page.tsx

  settings/
    page.tsx
```

---

## 8. Estructura de carpetas propuesta

```txt
src/
  app/
    layout.tsx
    page.tsx
    sign-in/
    sign-up/
    dashboard/
    settings/

  components/
    ui/
    layout/
      public-navbar.tsx
      public-footer.tsx
      app-sidebar.tsx
      app-header.tsx
      app-shell.tsx
    landing/
      hero-section.tsx
      how-it-works-section.tsx
      benefits-section.tsx
      landing-cta-section.tsx
    dashboard/
      summary-metrics.tsx
      summaries-table.tsx
      summary-card.tsx
      empty-summaries-state.tsx
    settings/
      account-settings-card.tsx
      preferences-card.tsx
      integrations-overview.tsx
      integration-status-card.tsx

  lib/
    utils.ts
    mock-data.ts
    routes.ts

  types/
    call-summary.ts
    integration.ts
```

---

## 9. Tipos de datos frontend

## 9.1 CallSummary

```ts
export type CallSummaryStatus =
  | "completed"
  | "closed_by_silence"
  | "rejected_by_rules"
  | "failed";

export type CallSummary = {
  id: string;
  callerNumber: string;
  alternativeNumber: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  status: CallSummaryStatus;
  closeReason?: string;
  title: string;
  summary: string;
  transcript?: string;
};
```

---

## 9.2 IntegrationStatus

```ts
export type IntegrationProvider = "twilio" | "elevenlabs" | "n8n" | "supabase";

export type IntegrationStatus = {
  provider: IntegrationProvider;
  label: string;
  description: string;
  status: "pending" | "connected" | "error";
};
```

Para el MVP, todos los servicios pueden mostrarse como:

```ts
status: "pending";
```

---

## 10. Datos mock iniciales

Crear un archivo:

```txt
src/lib/mock-data.ts
```

Debe exportar:

```ts
export const mockCallSummaries: CallSummary[] = [];
export const mockIntegrationStatuses: IntegrationStatus[] = [];
```

Para la primera versión visual, se pueden agregar entre 3 y 5 llamadas mock.

Ejemplo:

```ts
export const mockCallSummaries: CallSummary[] = [
  {
    id: "summary_001",
    callerNumber: "+503 XXXX XXXX",
    alternativeNumber: "+1 XXX XXX XXXX",
    startedAt: "2026-07-04T10:30:00Z",
    endedAt: "2026-07-04T10:34:00Z",
    durationSeconds: 240,
    status: "completed",
    title: "Consulta general recibida",
    summary:
      "La persona realizó una consulta general. La IA respondió en español y la conversación finalizó correctamente.",
    transcript: "Transcripción de ejemplo pendiente de integración real.",
  },
  {
    id: "summary_002",
    callerNumber: "+503 XXXX XXXX",
    alternativeNumber: "+1 XXX XXX XXXX",
    startedAt: "2026-07-04T11:15:00Z",
    durationSeconds: 5,
    status: "closed_by_silence",
    closeReason: "El emisor no comunicó nada durante el tiempo de espera.",
    title: "Llamada cerrada por silencio",
    summary: "La llamada fue cerrada porque no hubo comunicación del emisor.",
    transcript: "",
  },
];
```

---

## 11. Componentes principales

## 11.1 PublicNavbar

Responsabilidad:

Mostrar navegación pública.

Debe incluir:

- Nombre de la app.
- Link a inicio.
- Botón de iniciar sesión.
- Botón de crear cuenta.

---

## 11.2 HeroSection

Responsabilidad:

Mostrar propuesta principal del producto.

Debe incluir:

- Headline.
- Subheadline.
- CTA principal.
- CTA secundario.
- Visual simple relacionado con llamadas, IA o resúmenes.

No usar todavía imágenes externas obligatorias.

---

## 11.3 HowItWorksSection

Responsabilidad:

Explicar el flujo en tres pasos.

Pasos sugeridos:

1. Obtén un número alternativo.
2. La IA atiende llamadas permitidas.
3. Consulta el resumen desde tu dashboard.

---

## 11.4 AppShell

Responsabilidad:

Servir como contenedor general para las rutas autenticadas.

Debe incluir:

- Sidebar.
- Header.
- Contenido principal.
- Menú de usuario de Clerk.

---

## 11.5 SummaryMetrics

Responsabilidad:

Mostrar métricas calculadas desde los datos mock.

Métricas:

- Total de llamadas.
- Resúmenes generados.
- Cerradas por silencio.
- Fallidas o rechazadas.

---

## 11.6 SummariesTable

Responsabilidad:

Mostrar listado de llamadas/resúmenes.

Columnas mínimas:

- Fecha.
- Número entrante.
- Estado.
- Duración.
- Título.
- Acción para ver detalle.

---

## 11.7 SummaryDetail

Responsabilidad:

Mostrar información completa de una llamada.

Debe recibir o resolver el `id` desde la ruta.

Si no existe el resumen:

- Mostrar estado de error o “Resumen no encontrado”.
- Ofrecer botón para volver al dashboard.

---

## 11.8 SettingsView

Responsabilidad:

Mostrar configuración básica de cuenta, preferencias e integraciones futuras.

No debe implementar todavía conexión real con APIs.

---

## 12. Estados de interfaz

Cada vista que muestre datos debe contemplar:

### Estado de carga

Usar `Skeleton` de shadcn/ui.

### Estado vacío

Ejemplo:

```txt
Aún no tienes resúmenes de llamadas.
Cuando tu número alternativo reciba llamadas procesadas por IA, aparecerán aquí.
```

### Estado de error

Ejemplo:

```txt
No pudimos cargar esta información.
Intenta nuevamente.
```

### Estado exitoso

Mostrar la información mock o real cuando exista.

---

## 13. Reglas de diseño

La interfaz debe ser:

1. Limpia.
2. Moderna.
3. Fácil de usar.
4. Enfocada en productividad.
5. Compatible con escritorio y móvil.
6. Preparada para crecer modularmente.
7. Construida con componentes reutilizables.

Estilo visual recomendado:

- Fondo claro por defecto.
- Cards con bordes suaves.
- Espaciado amplio.
- Jerarquía clara de texto.
- Uso moderado de badges para estados.
- Tablas simples y legibles.
- Sidebar compacta en desktop.
- Navegación responsive en móvil.

---

## 14. Estados visuales de llamada

Usar badges con estas etiquetas:

```txt
Completada
Cerrada por silencio
Rechazada por reglas
Fallida
```

Mapeo sugerido:

```ts
const statusLabels = {
  completed: "Completada",
  closed_by_silence: "Cerrada por silencio",
  rejected_by_rules: "Rechazada por reglas",
  failed: "Fallida",
};
```

---

## 15. Protección de rutas

Las rutas autenticadas deben requerir sesión activa:

```txt
/dashboard
/dashboard/summaries/[id]
/settings
```

Si el usuario no está autenticado, debe ser redirigido a:

```txt
/sign-in
```

Las rutas públicas deben ser accesibles sin autenticación:

```txt
/
sign-in
sign-up
```

---

## 16. Clerk

Usar Clerk para:

1. Registro.
2. Inicio de sesión.
3. Cierre de sesión.
4. Obtención básica del usuario autenticado.
5. Protección de rutas privadas.
6. Menú de usuario en el dashboard.

No implementar en esta fase:

- Roles.
- Organizaciones.
- Permisos avanzados.
- Billing desde Clerk.
- Metadata personalizada compleja.

---

## 17. Supabase

Para esta especificación frontend, Supabase solo se considera como integración futura.

No implementar todavía:

1. Cliente Supabase.
2. Lectura real de resúmenes.
3. Escritura real de datos.
4. Storage.
5. Realtime.
6. Auth de Supabase.

La autenticación del MVP debe quedar en Clerk.

---

## 18. Twilio, ElevenLabs y n8n

Para esta especificación frontend, estos servicios solo deben aparecer como contexto del producto y como tarjetas visuales en configuración.

No implementar todavía:

1. Webhooks.
2. Validación de credenciales.
3. Formularios de API keys.
4. Estado real de conexión.
5. Logs técnicos.
6. Ejecución de flujos.
7. Pruebas de llamada.

---

## 19. Criterios de aceptación

## 19.1 Landing

La landing se considera completa si:

1. Tiene hero principal.
2. Explica claramente qué hace la app.
3. Tiene CTA de registro.
4. Tiene CTA de inicio de sesión.
5. Es responsive.

---

## 19.2 Autenticación

La autenticación se considera completa si:

1. Existe página de registro.
2. Existe página de inicio de sesión.
3. Clerk controla el flujo de autenticación.
4. Las rutas privadas no son accesibles sin sesión.
5. El usuario autenticado puede acceder al dashboard.

---

## 19.3 Dashboard

El dashboard se considera completo si:

1. Muestra métricas generales.
2. Muestra listado de resúmenes mock.
3. Permite abrir el detalle de un resumen.
4. Tiene estado vacío.
5. Tiene layout autenticado.
6. Tiene navegación hacia configuración.

---

## 19.4 Detalle de resumen

La vista de detalle se considera completa si:

1. Muestra información de la llamada.
2. Muestra resumen.
3. Muestra estado de la llamada.
4. Muestra transcripción mock si existe.
5. Permite volver al dashboard.
6. Maneja resumen no encontrado.

---

## 19.5 Configuración

La configuración se considera completa si:

1. Muestra sección de cuenta.
2. Muestra sección de preferencias.
3. Muestra tarjetas de integraciones futuras.
4. No expone todavía formularios reales de credenciales.
5. Comunica visualmente que las integraciones están pendientes de configuración.

---

## 20. Prompt sugerido para Cursor Agent

Construye una web app MVP con Next.js, App Router, TypeScript, Tailwind CSS, shadcn/ui y Clerk.

La app debe tener una landing pública, páginas de sign-in y sign-up con Clerk, un dashboard protegido, una vista de detalle de resumen y una vista de configuración.

Usa datos mock para los resúmenes de llamadas. No conectes todavía Twilio, ElevenLabs, n8n ni Supabase. Solo muestra estas integraciones como tarjetas visuales en la sección de configuración con estado “Pendiente de configurar”.

Crea componentes reutilizables siguiendo una arquitectura clara por carpetas. Usa shadcn/ui para botones, cards, badges, tablas, skeletons, tabs y elementos de layout. Protege las rutas privadas usando Clerk. La interfaz debe ser responsive, limpia y preparada para evolucionar.

Rutas mínimas:

- `/`
- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/dashboard/summaries/[id]`
- `/settings`

Estados mínimos:

- Loading
- Empty
- Error
- Success

No implementar backend real todavía. No implementar formularios reales para credenciales externas. No implementar flujos reales de llamadas.

---

## 21. Preguntas abiertas para la siguiente especificación

Estas preguntas no bloquean el MVP visual, pero deben definirse después:

1. Nombre final de la aplicación.
2. Identidad visual: colores, logo y tono de marca.
3. Si el dashboard debe mostrar solo resúmenes o también llamadas pendientes/fallidas.
4. Si la configuración será por usuario individual o por empresa/equipo.
5. Si se necesitarán roles.
6. Si habrá planes de pago.
7. Si el usuario podrá tener más de un número alternativo.
8. Si los resúmenes tendrán etiquetas, tareas o recordatorios.
9. Si se guardará transcripción completa.
10. Si se mostrará historial técnico de eventos.
