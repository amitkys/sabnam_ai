import { useState, useEffect, useCallback } from "react";

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
  const { selectedLanguage, setSelectedLanguage, preferredLanguage } =
    useQuizStore();

  const [language, setLanguage] = useState<string | undefined>();
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [isLanguageSaved, setIsLanguageSaved] = useState(false);

  const handleLanguageChange = useCallback(
    async (value: string): Promise<boolean> => {
      setLanguage(value);
      setIsSavingToDb(true);
      setIsLanguageSaved(false); // Reset while saving

      try {
        if (!attemptId) {
          console.warn("Attempt ID is not defined. Cannot save language.");

          return false;
        }

        // Update store so other components see it too
        setSelectedLanguage(value);

        // Save to DB
        await updateSelectedLanguage(attemptId, value);
        setIsLanguageSaved(true);

        return true;
      } catch (error) {
        console.error("Failed to save language:", error);

        return false;
      } finally {
        setIsSavingToDb(false);
      }
    },
    [attemptId, setSelectedLanguage],
  );

  useEffect(() => {
    // Determine the language to set based on a clear priority:
    // 1. A language that was already selected in the current session.
    // 2. The preferred language for the test, if it's provided.
    // 3. If there's only one available language, default to that.
    // 4. Otherwise, leave it undefined to prompt the user to choose.
    const languageToSet =
      selectedLanguage ||
      preferredLanguage ||
      (availableLanguage?.length === 1 ? availableLanguage[0] : undefined);

    setLanguage(languageToSet);

    if (selectedLanguage) {
      // If a language was already selected in the store, it's considered "saved"
      // for the purpose of enabling the start button immediately.
      setIsLanguageSaved(true);
    }
  }, [selectedLanguage, preferredLanguage, availableLanguage]);

  const handleStart = async () => {
    let languageIsSetAndSaved = isLanguageSaved;

    if (!languageIsSetAndSaved && language) {
      languageIsSetAndSaved = await handleLanguageChange(language);
    }

    if (languageIsSetAndSaved || !attemptId) {
      onStart();
    }
  };

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
              value={language}
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
