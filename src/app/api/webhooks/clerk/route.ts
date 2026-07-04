import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";

import {
  deleteUserFromClerk,
  upsertUserFromClerk,
} from "@/lib/supabase/users";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await upsertUserFromClerk(event.data);
        break;
      case "user.deleted":
        if (event.data.id) {
          await deleteUserFromClerk(event.data.id);
        }
        break;
      default:
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook verification failed";

    return Response.json({ error: message }, { status: 400 });
  }
}
