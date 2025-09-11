import { useEffect, useState } from "react";
import useSWR from "swr";
import { HelpCircle, CheckCircle, History } from "lucide-react";

import { ShowLoading } from "@/components/showLoading";
import { useTestHistory } from "@/lib/store/test-history-Store";
import { ITestAttemptHistoryResponse } from "@/lib/type";
import { fetcher } from "@/utils/fetcher";

interface TestSeriesCardContentProps {
  totalQuestions: number;
  hasAttempted: boolean;
  lastScore?: number | null;
  testSeriesId: string;
  onOpenDrawer: (isOpen: boolean) => void;
}

export const TestSeriesCardContent = ({
  totalQuestions,
  hasAttempted,
  lastScore,
  testSeriesId,
  onOpenDrawer,
}: TestSeriesCardContentProps) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { setHistory, setLoading, setError } = useTestHistory();

  const {
    data: testHistory,
    error,
    isLoading,
  } = useSWR<ITestAttemptHistoryResponse>(
    shouldFetch && testSeriesId ? `/api/testhistory/${testSeriesId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error.message || "Failed to load test history");
    } else {
      setError(null);
    }
  }, [error, setError]);

  useEffect(() => {
    if (testHistory) {
      setHistory(testHistory);
      onOpenDrawer(true);
      setShouldFetch(false);
    }
  }, [testHistory, setHistory, onOpenDrawer]);

  const handleViewHistory = () => {
    if (!isLoading) {
      setShouldFetch(true);
    }
  };

  return (
    <>
      <p className="text-sm text-muted-foreground flex items-center gap-1">
        <HelpCircle size={14} />
        Questions: <span className="ml-2 font-bold">{totalQuestions}</span>
      </p>

      {hasAttempted ? (
        <div className="flex items-center gap-6">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <CheckCircle size={14} />
            Last Score: <span className="ml-1 font-bold">{lastScore}</span>
          </p>

          <button
            className={`text-sm text-muted-foreground hover:text-primary transition-colors ${!isLoading ? "underline" : ""} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
            disabled={isLoading}
            onClick={handleViewHistory}
          >
            {isLoading ? (
              <ShowLoading loadingSize="sm" text="Loading..." />
            ) : (
              <>
                <History size={14} />
                View History
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="h-5" />
      )}
    </>
  );
};