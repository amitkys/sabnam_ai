"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Chapters for Chemistry (NCERT 10th)
const chemistryChapters = [
  { title: "रासायनिक अभिक्रियाएँ और समीकरण", url: "chemical-reactions-and-equations" },
  { title: "अम्ल, क्षारक और लवण", url: "acids-bases-and-salts" },
  { title: "धातु और अधातु", url: "metals-and-non-metals" },
  { title: "कार्बन और उसके यौगिक", url: "carbon-and-its-compounds" },
  { title: "तत्वों का आवर्त वर्गीकरण", url: "periodic-classification-of-elements" },
];

const ChemistryChapterSelector = () => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // Handle chapter selection
  const handleChapterSelect = (chapterUrl: string) => {
    setSelectedChapter(chapterUrl);
  };

  // Get the URL for the selected chapter
  const selectedChapterUrl = `/ncert/10th/chemistry/${selectedChapter}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Large Card */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Chemistry Chapters
          </CardTitle>
        </CardHeader>

        {/* Chapter Buttons */}
        <CardContent className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {chemistryChapters.map((chapter, index) => (
            <Button
              key={index}
              className="w-full text-lg py-6"
              variant={
                selectedChapter === chapter.url ? "default" : "outline"
              }
              onClick={() => handleChapterSelect(chapter.url)}
            >
              {chapter.title}
            </Button>
          ))}
        </CardContent>

        {/* Full-width Button */}
        <CardFooter className="mt-6">
          {selectedChapter ? (
            <Button asChild className="w-full text-lg py-6" size={"lg"}>
              <Link href={selectedChapterUrl}>Explore Chapter</Link>
            </Button>
          ) : (
            <Button disabled className="w-full text-lg py-6" size={"lg"}>
              Explore Chapter
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChemistryChapterSelector;
