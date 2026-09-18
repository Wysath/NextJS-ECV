import { cn } from "@/lib/cn";

// Decorative: the notice link in the hero already gives keyboard and screen reader users a way down
export function ScrollIndicator({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center gap-3 text-paper/60", className)}>
      <span className="eyebrow">Défiler</span>
      <span className="relative h-8 w-px overflow-hidden bg-paper/20">
        <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-paper motion-reduce:animate-none" />
      </span>
    </div>
  );
}
