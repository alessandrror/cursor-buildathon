import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CallDetailAgendaCard } from "@/components/dashboard/call-detail-agenda-card";
import { CallTranscript } from "@/components/dashboard/call-transcript";
import { MockDataBanner } from "@/components/dashboard/mock-data-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/lib/routes";
import type { CallDetail } from "@/types/call";

type CallDetailViewProps = {
  call: CallDetail;
  showMockBanner?: boolean;
};

export function CallDetailView({ call, showMockBanner }: CallDetailViewProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Button variant="ghost" size="sm" className="-ml-2 mb-4" asChild>
        <Link href={routes.dashboard}>
          <ArrowLeft data-icon="inline-start" />
          Volver al listado
        </Link>
      </Button>

      <header className="space-y-4">
        <CallDetailAgendaCard call={call} />
        {showMockBanner && <MockDataBanner />}
      </header>

      {call.summary && (
        <Card className="mt-6 gap-0 border-primary/15 bg-secondary/40 py-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumen para ti</CardTitle>
          </CardHeader>
          <CardContent className="pb-5 text-sm leading-7 sm:text-base">
            {call.summary}
          </CardContent>
        </Card>
      )}

      {call.transcript && call.transcript.length > 0 && (
        <div className="mt-8">
          <CallTranscript turns={call.transcript} />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
        <Button variant="outline" disabled title="Próximamente">
          Bloquear este número
        </Button>
        <Button variant="secondary" disabled title="Próximamente">
          Confiar en este número
        </Button>
      </div>
    </div>
  );
}
