"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { dispatchCallCompletedEvent } from "@/lib/calls/events";

type AgentWidgetProps = {
  ownerName: string;
  clerkUserId: string;
};

export function AgentWidget({ ownerName, clerkUserId }: AgentWidgetProps) {
  const [agentId, setAgentId] = useState<string | null>(null);
  const widgetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    fetch("/api/agent/signed-url")
      .then((r) => r.json())
      .then((d) => setAgentId(d.agent_id ?? null))
      .catch(console.error);
  }, []);

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

  if (!agentId || !clerkUserId) return null;

  return (
    <>
      {/* @ts-expect-error — web component sin tipos */}
      <elevenlabs-convai
        ref={widgetRef}
        agent-id={agentId}
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
