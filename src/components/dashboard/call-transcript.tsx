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
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Transcripción</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-5 pb-5 pt-2">
        {turns.map((turn, index) => {
          const isAgent = turn.role === "agent";
          const timestamp = formatTurnTime(turn.time_in_call_secs);

          return (
            <div
              key={`${turn.role}-${index}`}
              className={cn("flex flex-col gap-1", isAgent ? "items-end" : "items-start")}
            >
              <div className="text-xs font-medium text-muted-foreground">
                <span>{isAgent ? "GhostLine" : "Llamante"}</span>
                {timestamp && <span aria-hidden> · </span>}
                {timestamp && (
                  <time dateTime={`PT${turn.time_in_call_secs}S`}>
                    {timestamp}
                  </time>
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6",
                  isAgent
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground",
                )}
              >
                <p>{turn.message}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
