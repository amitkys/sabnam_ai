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

// Chapters for Math
const mathChapters = [
  { title: "वास्तविक संख्याएं", url: "real-numbers" },
  { title: "बहुपद", url: "polynomials" },
  { title: "दो चर वाले रैखिक समीकरण", url: "linear-equations-in-two-variables" },
  { title: "द्विघात समीकरण", url: "quadratic-equations" },
  { title: "समांतर श्रेढ़ियाँ", url: "arithmetic-progressions" },
  { title: "त्रिभुज", url: "triangles" },
  { title: "निर्देशांक ज्यामिति", url: "coordinate-geometry" },
  { title: "त्रिकोणमिति का परिचय", url: "introduction-to-trigonometry" },
  { title: "त्रिकोणमिति के कुछ अनुप्रयोग", url: "some-applications-of-trigonometry" },
  { title: "वृत्त", url: "circles" },
  { title: "रचनाएँ", url: "constructions" },
  { title: "वृत्तों से संबंधित क्षेत्रफल", url: "areas-related-to-circles" },
  { title: "पृष्ठीय क्षेत्रफल और आयतन", url: "surface-areas-and-volumes" },
  { title: "सांख्यिकी", url: "statistics" },
  { title: "प्रायिकता", url: "probability" },
];

const MathChapterSelector = () => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // Handle chapter selection
  const handleChapterSelect = (chapterUrl: string) => {
    setSelectedChapter(chapterUrl);
  };

  // Get the URL for the selected chapter
  const selectedChapterUrl = `/ncert/10th/math/${selectedChapter}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Large Card */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Math Chapters
          </CardTitle>
        </CardHeader>

        {/* Chapter Buttons */}
        <CardContent className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {mathChapters.map((chapter, index) => (
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

export default MathChapterSelector;