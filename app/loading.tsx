import { Loader } from "@/components/ui/loader";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-row gap-2">
      <Loader size="small" variant="spin" />
      <p className="text-base">Redirecting...</p>
    </div>
  );
}
