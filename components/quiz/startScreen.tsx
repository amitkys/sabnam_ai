import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuizStore } from "@/lib/store/useQuizStore";
import { updateSelectedLanguage } from "@/lib/actions";

interface StartScreenProps {
  onStart: () => void;
  attemptId: string | undefined;
  availableLanguage: string[] | undefined;
}

export const StartScreen = ({
  onStart,
  attemptId,
  availableLanguage,
}: StartScreenProps) => {
  const { selectedLanguage, setSelectedLanguage } = useQuizStore();

  // Keep local language state controlled
  const [language, setLanguage] = useState<string | undefined>(
    selectedLanguage ?? undefined,
  );

  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [isLanguageSaved, setIsLanguageSaved] = useState(false);

  // Sync local state if store updates later (e.g. when backend data comes in)
  useEffect(() => {
    if (selectedLanguage) {
      setLanguage(selectedLanguage);
      // If language is already set from store, consider it as saved
      setIsLanguageSaved(true);
    }
  }, [selectedLanguage]);

  // Check if language is already saved on component mount
  useEffect(() => {
    if (selectedLanguage && attemptId) {
      setIsLanguageSaved(true);
    }
  }, [selectedLanguage, attemptId]);

  const handleLanguageChange = async (value: string) => {
    setLanguage(value);
    setIsSavingToDb(true);
    setIsLanguageSaved(false); // Reset while saving

    try {
      if (!attemptId) {
        alert("Attempt ID is not defined. Cannot save language.");

        return;
      }

      // Update store so other components see it too
      setSelectedLanguage(value);

      // Save to DB
      await updateSelectedLanguage(attemptId, value);
      setIsLanguageSaved(true);
    } catch (error) {
      console.error("Failed to save language:", error);
      // Don't set isLanguageSaved to true if there was an error
    } finally {
      setIsSavingToDb(false);
    }
  };

  const handleStart = async () => {
    // If no language is selected yet, try to save the current one
    if (!isLanguageSaved && language && attemptId) {
      setIsSavingToDb(true);
      try {
        setSelectedLanguage(language);
        await updateSelectedLanguage(attemptId, language);
        setIsLanguageSaved(true);
      } catch (error) {
        console.error("Failed to save language:", error);
        setIsSavingToDb(false);

        return;
      }
      setIsSavingToDb(false);
    }

    // Only proceed if language is saved or no attemptId (for testing)
    if (isLanguageSaved || !attemptId) {
      onStart();
    }
  };

  // Check if we can start (language is selected and saved, or only one language available)
  const canStart =
    isLanguageSaved || (availableLanguage?.length === 1 && language);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-4">
          <h1 className="text-xl font-semibold text-center">Setup Language</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {availableLanguage?.length === 1
                ? "Selected Language"
                : "Select Language"}{" "}
            </h3>
            <Select
              disabled={isSavingToDb}
              value={language ?? undefined}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a language" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguage?.map((lang, index) => (
                  <SelectItem key={index} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Questions will be shown in this language.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={isSavingToDb || !language}
            onClick={handleStart}
          >
            {isSavingToDb ? "Saving..." : "Start Test"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
