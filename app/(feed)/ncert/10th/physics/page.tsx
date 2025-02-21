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

// Chapters for Physics (NCERT 10th)
const physicsChapters = [
  { title: "धारा विद्युत", url: "electricity" },
  { title: "विद्युत धारा के चुम्बकीय प्रभाव", url: "magnetic-effects-of-electric-current" },
  { title: "प्रकाश का परावर्तन", url: "reflection-of-light" },
  { title: "प्रकाश का अपवर्तन", url: "refraction-of-light" },
  { title: "मानव नेत्र और रंगबिरंगा संसार", url: "human-eye-and-colorful-world" },
  { title: "ऊर्जा के स्रोत", url: "sources-of-energy" },
];

const PhysicsChapterSelector = () => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // Handle chapter selection
  const handleChapterSelect = (chapterUrl: string) => {
    setSelectedChapter(chapterUrl);
  };

  // Get the URL for the selected chapter
  const selectedChapterUrl = `/ncert/10th/physics/${selectedChapter}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Large Card */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Physics Chapters
          </CardTitle>
        </CardHeader>

        {/* Chapter Buttons */}
        <CardContent className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {physicsChapters.map((chapter, index) => (
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

export default PhysicsChapterSelector;
