import Link from "next/link";

import { AuthControls } from "@/components/layout/auth-controls";
import { routes } from "@/lib/routes";

export function PublicNavbar() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={routes.home} className="text-sm font-semibold tracking-tight">
          AI Call Assistant
        </Link>
        <AuthControls />
      </div>
    </header>
  );
}
