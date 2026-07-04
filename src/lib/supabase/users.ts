import type { User, UserJSON } from "@clerk/nextjs/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type ClerkUserLike = Pick<User, "id" | "firstName" | "lastName" | "imageUrl"> & {
  emailAddresses?: User["emailAddresses"];
  primaryEmailAddressId?: User["primaryEmailAddressId"];
};

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

function mapClerkUserToRow(user: ClerkUserLike | UserJSON) {
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

export async function upsertUserFromClerk(user: ClerkUserLike | UserJSON) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase is not configured" };
  }

  const supabase = createAdminSupabaseClient();
  const row = mapClerkUserToRow(user);

  const { error } = await supabase.from("users").upsert(row, {
    onConflict: "id",
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

export async function deleteUserFromClerk(userId: string) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase is not configured" };
  }

  const supabase = createAdminSupabaseClient();

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}
