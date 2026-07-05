import type { User, UserJSON } from "@clerk/nextjs/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ClerkUserLike = Pick<User, "id" | "firstName" | "lastName" | "imageUrl"> & {
  emailAddresses?: User["emailAddresses"];
  primaryEmailAddressId?: User["primaryEmailAddressId"];
};

type UserInsert = Database["public"]["Tables"]["users"]["Insert"];

function getPrimaryEmail(user: ClerkUserLike | UserJSON) {
  if ("email_addresses" in user) {
    const primary =
      user.email_addresses.find(
        (address) => address.id === user.primary_email_address_id,
      ) ?? user.email_addresses[0];

    return primary?.email_address ?? null;
  }

  const primary =
    user.emailAddresses?.find(
      (address) => address.id === user.primaryEmailAddressId,
    ) ?? user.emailAddresses?.[0];

  return primary?.emailAddress ?? null;
}

function mapClerkUserToRow(user: ClerkUserLike | UserJSON): UserInsert {
  if ("first_name" in user) {
    return {
      id: user.id,
      email: getPrimaryEmail(user),
      first_name: user.first_name,
      last_name: user.last_name,
      image_url: user.image_url,
      updated_at: new Date().toISOString(),
    };
  }

  return {
    id: user.id,
    email: getPrimaryEmail(user),
    first_name: user.firstName,
    last_name: user.lastName,
    image_url: user.imageUrl,
    updated_at: new Date().toISOString(),
  };
}

async function upsertWithAdminClient(row: UserInsert) {
  const supabase = createAdminSupabaseClient();

  return supabase.from("users").upsert(row, {
    onConflict: "id",
  });
}

async function upsertWithAuthenticatedClient(row: UserInsert) {
  const supabase = await createServerSupabaseClient();

  return supabase.from("users").upsert(row, {
    onConflict: "id",
  });
}

export async function upsertUserFromClerk(user: ClerkUserLike | UserJSON) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase is not configured" };
  }

  const row = mapClerkUserToRow(user);
  const errors: string[] = [];

  if (isSupabaseAdminConfigured()) {
    const { error } = await upsertWithAdminClient(row);

    if (!error) {
      return { ok: true as const };
    }

    errors.push(`admin: ${error.message}`);
  } else {
    errors.push("admin: SUPABASE_SERVICE_ROLE_KEY is missing");
  }

  const { error: authError } = await upsertWithAuthenticatedClient(row);

  if (!authError) {
    return { ok: true as const };
  }

  errors.push(`authenticated: ${authError.message}`);

  return {
    ok: false as const,
    error: errors.join(" | "),
  };
}

export async function deleteUserFromClerk(userId: string) {
  if (!isSupabaseAdminConfigured()) {
    return { ok: false as const, error: "Supabase admin is not configured" };
  }

  const supabase = createAdminSupabaseClient();

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

export async function getOnboardingCompletedForUser(
  userId: string,
): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) {
    return false;
  }

  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[users] onboarding status lookup failed:", error.message);
    return false;
  }

  return data?.onboarding_completed ?? false;
}
