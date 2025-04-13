import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

interface QuizActionsProps {
  onSave: () => void;
  onLater: () => void;
  onSkip: () => void;
  isAnswerSelected?: boolean;
  isSaving: boolean;
  activeButton: "save" | "later" | "skip" | null;
}

export const QuizActions = ({
  onSave,
  onLater,
  onSkip,
  isAnswerSelected = false,
  isSaving = false,
  activeButton = null,
}: QuizActionsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Save & Next */}
          <Button
            className="flex-1 order-1 sm:order-3"
            disabled={isSaving}
            variant="default"
            onClick={onSave}
          >
            {isSaving && activeButton === "save" ? (
              <span className="flex items-center">
                <Loader className="mr-2" size="small" variant="spin" />
                Loading next question...
              </span>
            ) : (
              "Save & next"
            )}
          </Button>

          {/* Preview Later */}
          <Button
            className="flex-1 order-2 sm:order-2"
            disabled={isSaving}
            variant="outline"
            onClick={onLater}
          >
            {isSaving && activeButton === "later" ? (
              <span className="flex items-center">
                <Loader className="mr-2" size="small" variant="spin" />
                Loading next question...
              </span>
            ) : (
              "Preview later"
            )}
          </Button>

          {/* Skip */}
          <Button
            className="flex-1 order-3 sm:order-1"
            disabled={isSaving}
            variant="outline"
            onClick={onSkip}
          >
            {isSaving && activeButton === "skip" ? (
              <span className="flex items-center">
                <Loader className="mr-2" size="small" variant="spin" />
                Loading next question...
              </span>
            ) : (
              "Skip"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
