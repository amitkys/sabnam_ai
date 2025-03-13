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

// Chapters for Biology (NCERT 10th)
const biologyChapters = [
  { title: "जीवन की प्रक्रियाएँ", url: "life-processes" },
  { title: "नियंत्रण और समन्वय", url: "control-and-coordination" },
  { title: "जीव जनन कैसे करते हैं?", url: "how-do-organisms-reproduce" },
  { title: "अनुवांशिकता और जैव विकास", url: "heredity-and-evolution" },
  { title: "हमारा पर्यावरण", url: "our-environment" },
  { title: "प्राकृतिक संसाधनों का प्रबंधन", url: "management-of-natural-resources" },
];

const BiologyChapterSelector = () => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // Handle chapter selection
  const handleChapterSelect = (chapterUrl: string) => {
    setSelectedChapter(chapterUrl);
  };

  // Get the URL for the selected chapter
  const selectedChapterUrl = `/ncert/10th/biology/${selectedChapter}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Large Card */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Biology Chapters
          </CardTitle>
        </CardHeader>

        {/* Chapter Buttons */}
        <CardContent className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {biologyChapters.map((chapter, index) => (
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

export default BiologyChapterSelector;