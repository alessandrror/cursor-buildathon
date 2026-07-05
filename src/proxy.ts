import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { routes } from "@/lib/routes";
import { getOnboardingCompletedForUser } from "@/lib/supabase/users";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

const isOnboardingBypassRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  if (isPublicRoute(request)) {
    if (userId && request.nextUrl.pathname === "/") {
      const onboardingCompleted = await getOnboardingCompletedForUser(userId);

      if (!onboardingCompleted) {
        return NextResponse.redirect(new URL(routes.voiceOnboarding, request.url));
      }

      return NextResponse.redirect(new URL(routes.dashboard, request.url));
    }

    return;
  }

  await auth.protect();

  if (!userId) {
    return;
  }

  const onboardingCompleted = await getOnboardingCompletedForUser(userId);

  if (isOnboardingRoute(request) && onboardingCompleted) {
    return NextResponse.redirect(new URL(routes.dashboard, request.url));
  }

  if (!isOnboardingBypassRoute(request) && !onboardingCompleted) {
    return NextResponse.redirect(new URL(routes.voiceOnboarding, request.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
