"use client";

import { MicOff } from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dispatchCallCompletedEvent } from "@/lib/calls/events";

type AgentWidgetProps = {
  ownerName: string;
  clerkUserId: string;
};

export function AgentWidget({ ownerName, clerkUserId }: AgentWidgetProps) {
  const [agentId, setAgentId] = useState<string | null>(null);
<<<<<<< HEAD
<<<<<<< HEAD
  const [overrideVoiceId, setOverrideVoiceId] = useState<string | null>(null);
=======
>>>>>>> c9e7822 (Refactor dashboard components and enhance call handling features)
=======
  const [overrideVoiceId, setOverrideVoiceId] = useState<string | null>(null);
>>>>>>> 8a53055 (Enhance voice cloning features and onboarding process)
  const [microphoneStatus, setMicrophoneStatus] = useState<
    "checking" | "supported" | "unsupported"
  >("checking");
  const widgetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const mediaDevices = navigator.mediaDevices as
        | Partial<MediaDevices>
        | undefined;
      const hasGetUserMedia = typeof mediaDevices?.getUserMedia === "function";

      setMicrophoneStatus(hasGetUserMedia ? "supported" : "unsupported");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (microphoneStatus !== "supported" || !clerkUserId) return;

    fetch("/api/agent/signed-url")
      .then((r) => r.json())
      .then((d) => {
        setAgentId(d.agent_id ?? null);
        setOverrideVoiceId(d.override_voice_id ?? null);
      })
      .catch(console.error);
  }, [microphoneStatus, clerkUserId]);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    const onConversationEnded = () => {
      dispatchCallCompletedEvent();
    };

    widget.addEventListener("conversationEnded", onConversationEnded);

    return () => {
      widget.removeEventListener("conversationEnded", onConversationEnded);
    };
  }, [agentId]);

  if (microphoneStatus === "unsupported") {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <MicOff className="size-5" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle>Simulador no disponible</CardTitle>
              <CardDescription>
                El navegador no expone acceso al micrófono. Abre la app en
                localhost o en HTTPS y permite el micrófono para probar el agente.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!agentId || !clerkUserId) return null;

  return (
    <>
      {/* @ts-expect-error — web component sin tipos */}
      <elevenlabs-convai
        ref={widgetRef}
        agent-id={agentId}
        override-voice-id={overrideVoiceId ?? undefined}
        dynamic-variables={JSON.stringify({
          owner_name: ownerName,
          clerk_user_id: clerkUserId,
        })}
      />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
    </>
  );
}
