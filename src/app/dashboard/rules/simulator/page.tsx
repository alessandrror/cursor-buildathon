import { RuleSimulator } from "@/components/rules/rule-simulator";
import { RulesShell } from "@/components/rules/rules-shell";

export const metadata = {
  title: "Simulador de reglas | GhostLine",
};

export default function RulesSimulatorPage() {
  return (
    <RulesShell
      active="simulator"
      title="Simulador de escenarios"
      description="Prueba cómo responderían tus reglas ante distintas llamadas, sin recibir una llamada real."
    >
      <RuleSimulator />
    </RulesShell>
  );
}
