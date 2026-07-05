"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

export function AgentWidget({ ownerName }: { ownerName: string }) {
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/agent/signed-url")
      .then((r) => r.json())
      .then((d) => setAgentId(d.agent_id ?? null))
      .catch(console.error);
  }, []);

  if (!agentId) return null;

  return (
    <>
      {/* @ts-expect-error — web component sin tipos */}
      <elevenlabs-convai
        agent-id={agentId}
        dynamic-variables={JSON.stringify({ owner_name: ownerName })}
      />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
    </>
  );
}
