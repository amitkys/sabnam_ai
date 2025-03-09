import { Button } from "@/components/ui/button";

interface QuizActionsProps {
  onSave: () => void;
  onLater: () => void;
  onSkip: () => void;
}

export const QuizActions = ({ onSave, onLater, onSkip }: QuizActionsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Save & Next */}
          <Button
            className="flex-1 order-1 sm:order-3"
            variant="default"
            onClick={onSave}
          >
            Save & next
          </Button>

          {/* Preview Later */}
          <Button
            className="flex-1 order-2 sm:order-2"
            variant="outline"
            onClick={onLater}
          >
            Preview later
          </Button>

          {/* Skip */}
          <Button
            className="flex-1 order-3 sm:order-1"
            variant="outline"
            onClick={onSkip}
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
};