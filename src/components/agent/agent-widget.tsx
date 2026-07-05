"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

export function AgentWidget({ ownerName }: { ownerName: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/agent/signed-url")
      .then((r) => r.json())
      .then((d) => setSignedUrl(d.signed_url))
      .catch(console.error);
  }, []);

  if (!signedUrl) return null;

  return (
    <>
      {/* @ts-expect-error — web component sin tipos */}
      <elevenlabs-convai
        signed-url={signedUrl}
        dynamic-variables={JSON.stringify({ owner_name: ownerName })}
      />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
    </>
  );
}
