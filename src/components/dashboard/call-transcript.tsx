import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TranscriptTurn } from "@/types/call";
import { cn } from "@/lib/utils";

type CallTranscriptProps = {
  turns: TranscriptTurn[];
};

function formatTurnTime(seconds?: number): string | null {
  if (seconds == null) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function CallTranscript({ turns }: CallTranscriptProps) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base">Transcripción</CardTitle>
        <p className="text-sm text-muted-foreground">
          Conversación entre el agente GhostLine y el emisor.
        </p>
      </CardHeader>
      <CardContent className="max-h-[28rem] space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        {turns.map((turn, index) => {
          const isAgent = turn.role === "agent";
          const timestamp = formatTurnTime(turn.time_in_call_secs);

          return (
            <div
              key={`${turn.role}-${index}`}
              className={cn("flex", isAgent ? "justify-start" : "justify-end")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6",
                  isAgent
                    ? "rounded-bl-md bg-secondary text-secondary-foreground"
                    : "rounded-br-md border border-border bg-card text-foreground",
                )}
              >
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span>{isAgent ? "Agente" : "Emisor"}</span>
                  {timestamp && <span aria-hidden>·</span>}
                  {timestamp && (
                    <time dateTime={`PT${turn.time_in_call_secs}S`}>
                      {timestamp}
                    </time>
                  )}
                </div>
                <p>{turn.message}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
