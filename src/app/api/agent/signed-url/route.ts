import { auth } from "@clerk/nextjs/server";

const AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID ?? "agent_3701kwr53y6qeberkrgckd9xkhdb";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
    { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! } }
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to get signed URL" }, { status: 502 });
  }

  const { signed_url } = await res.json();
  return Response.json({ signed_url });
}
