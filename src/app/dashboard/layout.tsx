import { currentUser } from "@clerk/nextjs/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { upsertUserFromClerk } from "@/lib/supabase/users";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isSupabaseConfigured()) {
    const user = await currentUser();

    if (user) {
      await upsertUserFromClerk(user);
    }
  }

  return children;
}
