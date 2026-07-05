/**
 * Push a workflow JSON file to n8n Cloud (update by name match).
 * Usage: bun --env-file=.env scripts/push-n8n-workflow.ts elevenlabs-post-call
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workflowName = process.argv[2] ?? "elevenlabs-post-call";
const apiKey = process.env.N8N_API_KEY;
const baseUrl = process.env.N8N_WEBHOOK_URL?.replace(/\/$/, "");

if (!apiKey || !baseUrl) {
  console.error("Missing N8N_API_KEY or N8N_WEBHOOK_URL");
  process.exit(1);
}

const fileMap: Record<string, string> = {
  "elevenlabs-post-call": "n8n/workflows/webhook-elevenlabs-post-call.json",
  "twilio-incoming-call": "n8n/workflows/incoming-call.json",
};

const filePath = fileMap[workflowName];
if (!filePath) {
  console.error(`Unknown workflow: ${workflowName}`);
  process.exit(1);
}

const localWorkflow = JSON.parse(readFileSync(resolve(filePath), "utf8"));

const listRes = await fetch(`${baseUrl}/api/v1/workflows`, {
  headers: { "X-N8N-API-KEY": apiKey },
});

if (!listRes.ok) {
  console.error("Failed to list workflows:", listRes.status, await listRes.text());
  process.exit(1);
}

const { data: workflows } = (await listRes.json()) as {
  data: Array<{ id: string; name: string; active: boolean }>;
};

const remote = workflows.find((workflow) => workflow.name === localWorkflow.name);
if (!remote) {
  console.error(`Workflow not found in n8n: ${localWorkflow.name}`);
  process.exit(1);
}

const updateRes = await fetch(`${baseUrl}/api/v1/workflows/${remote.id}`, {
  method: "PUT",
  headers: {
    "X-N8N-API-KEY": apiKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: localWorkflow.name,
    nodes: localWorkflow.nodes,
    connections: localWorkflow.connections,
    settings: localWorkflow.settings ?? {},
  }),
});

if (!updateRes.ok) {
  console.error("Failed to update workflow:", updateRes.status, await updateRes.text());
  process.exit(1);
}

console.log(`Updated workflow ${localWorkflow.name} (${remote.id})`);

if (localWorkflow.active && !remote.active) {
  const activateRes = await fetch(`${baseUrl}/api/v1/workflows/${remote.id}/activate`, {
    method: "POST",
    headers: { "X-N8N-API-KEY": apiKey },
  });

  if (!activateRes.ok) {
    console.error("Updated but failed to activate:", activateRes.status, await activateRes.text());
    process.exit(1);
  }

  console.log("Activated workflow.");
} else if (localWorkflow.active) {
  console.log("Workflow already active (or activation not required).");
}
