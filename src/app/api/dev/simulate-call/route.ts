import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildEmptyTranscriptSummary } from "@/lib/schemas/call-summary-output";

type SimulateCallBody = {
  userId: string;
  phoneNumberId: string;
  callerNumber?: string;
  withSummary?: boolean;
};

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const devKey = process.env.DEV_API_KEY;
  const authHeader = request.headers.get("authorization");

  if (!devKey || authHeader !== `Bearer ${devKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SimulateCallBody;

  try {
    body = (await request.json()) as SimulateCallBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.userId || !body.phoneNumberId) {
    return NextResponse.json(
      { error: "userId and phoneNumberId are required" },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();
  const callSid = `CA_dev_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const conversationId = `conv_dev_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const now = new Date().toISOString();

  const { data: call, error: callError } = await supabase
    .from("calls")
    .insert({
      user_id: body.userId,
      phone_number_id: body.phoneNumberId,
      twilio_call_sid: callSid,
      caller_number: body.callerNumber ?? "+50370001234",
      decision: "answer",
      matched_rule: "dev_simulate",
      outcome: "completed",
      duration_seconds: 45,
      started_at: now,
      ended_at: now,
    })
    .select("id, user_id")
    .single();

  if (callError || !call) {
    return NextResponse.json(
      { error: callError?.message ?? "Failed to create call" },
      { status: 500 },
    );
  }

  const transcript = [
    {
      role: "agent",
      message:
        "Hola, ha llamado al asistente de prueba. ¿De parte de quién y cuál es el motivo?",
      time_in_call_secs: 0,
    },
    {
      role: "user",
      message: "Buenas, soy Carlos de Telecom Promo con una oferta de fibra.",
      time_in_call_secs: 3,
    },
  ];

  const { error: transcriptError } = await supabase
    .from("call_transcripts")
    .insert({
      call_id: call.id,
      conversation_id: conversationId,
      transcript,
    });

  if (transcriptError) {
    return NextResponse.json({ error: transcriptError.message }, { status: 500 });
  }

  if (body.withSummary !== false) {
    const summary = {
      caller_name: "Carlos",
      caller_company: "Telecom Promo",
      reason: "Oferta comercial de plan de internet.",
      summary:
        "Carlos de Telecom Promo ofreció un cambio de plan de fibra con descuento. Llamada comercial identificada como posible spam.",
      category: "spam_comercial" as const,
      urgency: "baja" as const,
    };

    const payload =
      body.withSummary === undefined
        ? summary
        : { ...buildEmptyTranscriptSummary(), ...summary };

    const { error: summaryError } = await supabase.from("call_summaries").insert({
      call_id: call.id,
      user_id: call.user_id,
      caller_name: payload.caller_name,
      caller_company: payload.caller_company,
      reason: payload.reason,
      summary: payload.summary,
      category: payload.category,
      urgency: payload.urgency,
      is_degraded: false,
    });

    if (summaryError) {
      return NextResponse.json({ error: summaryError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    callId: call.id,
    twilioCallSid: callSid,
    conversationId,
  });
}
