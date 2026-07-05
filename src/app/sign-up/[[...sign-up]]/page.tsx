import { SignUp } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/clerk-appearance";
import { routes } from "@/lib/routes";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path={routes.signUp}
        signInUrl={routes.signIn}
      />
    </main>
  );
}
