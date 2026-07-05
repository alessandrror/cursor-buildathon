import { SignIn } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/clerk-appearance";
import { routes } from "@/lib/routes";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path={routes.signIn}
        signUpUrl={routes.signUp}
        forceRedirectUrl={routes.dashboard}
        fallbackRedirectUrl={routes.dashboard}
      />
    </main>
  );
}
