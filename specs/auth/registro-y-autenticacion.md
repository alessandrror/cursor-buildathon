# SPEC: Registro y autenticación de usuarios

- user_story: US-001
- autor: @noe
- fecha: 2026-07-04
- estado: borrador

## Descripción
Permite a una persona registrarse e iniciar sesión en la aplicación usando Supabase Auth
(Google OAuth 2.0 como método principal, email + contraseña como alternativa). Al completar el
primer registro, el sistema crea su perfil en la tabla `profiles` y lo dirige al onboarding de
aprovisionamiento de número (ver `numeros/aprovisionamiento-numero-twilio.md`).

## Comportamiento esperado
- El usuario hace clic en "Continuar con Google" → se abre el flujo OAuth de Google gestionado por Supabase Auth.
- Si autoriza y es un usuario nuevo → se crea la fila en `auth.users` y, vía trigger, la fila en `public.profiles`; se redirige a `/onboarding`.
- Si autoriza y ya existe → inicia sesión y se redirige a `/dashboard`.
- Registro con email: formulario email + contraseña → Supabase envía email de confirmación → el usuario no puede aprovisionar número hasta confirmar el email.
- La sesión se mantiene con el manejo de tokens de `supabase-js` (access token + refresh token); el frontend nunca almacena el token en `localStorage` accesible a scripts de terceros.
- Cerrar sesión invalida la sesión local y redirige a `/login`.

## Casos borde
- Usuario cancela el popup de Google → volver a `/login` sin mensaje de error.
- Email ya registrado con contraseña e intenta Google con el mismo email → Supabase vincula identidades solo si `email_confirmed`; si no, mostrar "Ya existe una cuenta con este correo, inicia sesión con tu contraseña".
- Token de sesión expirado durante el uso → `supabase-js` refresca silenciosamente; si el refresh falla, redirigir a `/login` conservando la ruta destino.
- Falla temporal de Supabase Auth → mostrar mensaje "No pudimos iniciar sesión, intenta de nuevo" con opción de reintento; no dejar spinner infinito.

## Criterios de aceptación
- [ ] Un usuario nuevo con Google queda registrado y llega a `/onboarding` en un solo flujo.
- [ ] Un usuario con email no confirmado ve el aviso de confirmación pendiente y no puede avanzar al onboarding.
- [ ] Un usuario autenticado ve su nombre y avatar en el header del dashboard.
- [ ] Todas las rutas privadas redirigen a `/login` si no hay sesión válida (guard de Vue Router).
- [ ] Las políticas RLS impiden que un usuario lea filas de `profiles` que no sean la suya (verificable con test SQL).

## Dependencias
- Supabase Auth (proveedor Google configurado en el proyecto).
- Trigger `on_auth_user_created` → inserta en `profiles` (ver `datos/modelo-datos-core.md`).

## Fuera de alcance
- Login con Facebook, Apple o GitHub.
- Autenticación de dos factores (2FA).
- Recuperación de cuenta por SMS.

## Notas técnicas
- Frontend: Vue 3 + `@supabase/supabase-js` v2; guard global en Vue Router que resuelve `getSession()` antes de montar rutas privadas.
- No se construye backend propio de auth: Supabase emite el JWT que las políticas RLS consumen.
