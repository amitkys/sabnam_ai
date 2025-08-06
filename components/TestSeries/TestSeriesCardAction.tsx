import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

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
      className="max-w-7xl w-full"
      disabled={loading}
      onClick={onStartTest}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader size="small" variant="spin" />
        </div>
      ) : hasAttempted ? (
        "Retake Test"
      ) : (
        "Start Test"
      )}
    </Button>
  );
};
