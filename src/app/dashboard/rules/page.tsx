import { RulesManager } from "@/components/rules/rules-manager";
import { RulesShell } from "@/components/rules/rules-shell";

export const metadata = {
  title: "Reglas de contestación | GhostLine",
};

export default function RulesPage() {
  return (
    <RulesShell
      active="config"
      title="Reglas de contestación"
      description="Define qué llamadas atiende el agente y cuáles se rechazan."
    >
      <RulesManager />
    </RulesShell>
  );
}
