import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { ArrowRight, Repeat } from "lucide-react";

interface TestSeriesCardActionsProps {
  loading: boolean;
  hasAttempted: boolean;
  onStartTest: () => void;
}

export const TestSeriesCardActions = ({
  loading,
  hasAttempted,
  onStartTest,
}: TestSeriesCardActionsProps) => {
  return (
    <Button
      className="max-w-7xl w-full flex items-center gap-2"
      disabled={loading}
      onClick={onStartTest}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader size="small" variant="spin" />
        </div>
      ) : hasAttempted ? (
        <>
          <Repeat size={14} />
          Retake Test
        </>
      ) : (
        <>
          Start Test
          <ArrowRight size={14} />
        </>
      )}
    </Button>
  );
};
