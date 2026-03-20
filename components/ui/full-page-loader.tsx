import { Loader } from "@/components/ui/loader";

interface FullPageLoaderProps {
  text?: string;
  variant?: "bars" | "ring" | "spin";
}

export function FullPageLoader({
  text = "Loading...",
  variant
}: FullPageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-md"
    >
      <div className="flex flex-col items-center gap-4 p-8 bg-background/80 backdrop-blur-lg rounded-2xl shadow-xl border">
        <Loader size="2xl" intent="primary" variant={variant} />
        {text && (
          <p className="text-lg font-medium tracking-tight animate-pulse text-foreground" aria-label={text}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
