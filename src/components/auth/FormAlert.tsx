import { cn } from "@/lib/cn";

type FormAlertProps = {
  message: string | null;
  tone?: "error" | "success";
};

// Always rendered, so screen readers announce the message when it appears rather than missing the new node
export function FormAlert({ message, tone = "error" }: FormAlertProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "border-l-2 px-4 py-3 text-small empty:hidden",
        tone === "error" ? "border-accent bg-accent/5 text-accent" : "border-ink bg-ink/5 text-ink",
      )}
    >
      {message}
    </p>
  );
}
