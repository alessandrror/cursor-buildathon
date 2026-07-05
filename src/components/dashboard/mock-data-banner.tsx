export function MockDataBanner() {
  return (
    <p
      className="rounded-lg border border-border bg-accent/20 px-4 py-3 text-sm text-muted-foreground"
      role="status"
    >
      Modo demostración: estás viendo datos de ejemplo. Cambia{" "}
      <code className="text-foreground">USE_MOCK_CALLS=false</code> en{" "}
      <code className="text-foreground">.env</code> para conectar Supabase y el
      pipeline n8n.
    </p>
  );
}
