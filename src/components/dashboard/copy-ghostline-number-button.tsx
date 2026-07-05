"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

type CopyGhostLineNumberButtonProps = {
  number: string | null;
};

export function CopyGhostLineNumberButton({
  number,
}: CopyGhostLineNumberButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    if (!number) return;

    await navigator.clipboard.writeText(number);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      className={cn(
        "mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary-foreground/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:mt-0",
        !number && "cursor-not-allowed opacity-60",
      )}
      onClick={copyNumber}
      disabled={!number}
    >
      {copied ? "Copiado" : "Copiar número"}
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </button>
  );
}
