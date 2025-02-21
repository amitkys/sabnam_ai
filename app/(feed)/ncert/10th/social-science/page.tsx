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

// कक्षा 10 सामाजिक विज्ञान के अध्याय
const socialScienceChapters = [
  // इतिहास (भारत और समकालीन विश्व - 2)
  { title: "इतिहास - अध्याय 1: यूरोप में राष्ट्रवाद का उदय", url: "history/chapter-1" },
  { title: "इतिहास - अध्याय 2: भारत में राष्ट्रवाद", url: "history/chapter-2" },
  { title: "इतिहास - अध्याय 3: भूमंडलीकृत विश्व का बनना", url: "history/chapter-3" },
  { title: "इतिहास - अध्याय 4: औद्योगीकरण का युग", url: "history/chapter-4" },
  { title: "इतिहास - अध्याय 5: मुद्रण संस्कृति और आधुनिक दुनिया", url: "history/chapter-5" },
  
  // भूगोल (समकालीन भारत - 2)
  { title: "भूगोल - अध्याय 1: संसाधन एवं विकास", url: "geography/chapter-1" },
  { title: "भूगोल - अध्याय 2: वन एवं वन्य जीव संसाधन", url: "geography/chapter-2" },
  { title: "भूगोल - अध्याय 3: जल संसाधन", url: "geography/chapter-3" },
  { title: "भूगोल - अध्याय 4: कृषि", url: "geography/chapter-4" },
  { title: "भूगोल - अध्याय 5: खनिज तथा ऊर्जा संसाधन", url: "geography/chapter-5" },
  { title: "भूगोल - अध्याय 6: विनिर्माण उद्योग", url: "geography/chapter-6" },
  { title: "भूगोल - अध्याय 7: राष्ट्रीय अर्थव्यवस्था की जीवन रेखाएँ", url: "geography/chapter-7" },
  
  // राजनीतिक विज्ञान (लोकतांत्रिक राजनीति - 2)
  { title: "राजनीतिक विज्ञान - अध्याय 1: सत्ता की साझेदारी", url: "political-science/chapter-1" },
  { title: "राजनीतिक विज्ञान - अध्याय 2: संघवाद", url: "political-science/chapter-2" },
  { title: "राजनीतिक विज्ञान - अध्याय 3: जाति, धर्म और लैंगिक मसले", url: "political-science/chapter-3" },
  { title: "राजनीतिक विज्ञान - अध्याय 4: राजनीतिक दल", url: "political-science/chapter-4" },
  { title: "राजनीतिक विज्ञान - अध्याय 5: लोकतंत्र के परिणाम", url: "political-science/chapter-5" },
  
  // अर्थशास्त्र (आर्थिक विकास की समझ)
  { title: "अर्थशास्त्र - अध्याय 1: विकास", url: "economics/chapter-1" },
  { title: "अर्थशास्त्र - अध्याय 2: भारतीय अर्थव्यवस्था के क्षेत्रक", url: "economics/chapter-2" },
  { title: "अर्थशास्त्र - अध्याय 3: मुद्रा और साख", url: "economics/chapter-3" },
  { title: "अर्थशास्त्र - अध्याय 4: वैश्वीकरण और भारतीय अर्थव्यवस्था", url: "economics/chapter-4" },
  { title: "अर्थशास्त्र - अध्याय 5: उपभोक्ता अधिकार", url: "economics/chapter-5" },
];

const SocialScienceChapterSelector = () => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // अध्याय चयन हैंडल करें
  const handleChapterSelect = (chapterUrl: string) => {
    setSelectedChapter(chapterUrl);
  };

  // चयनित अध्याय के लिए URL प्राप्त करें
  const selectedChapterUrl = selectedChapter ? `/ncert/10th/social-science/${selectedChapter}` : "#";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* बड़ा कार्ड */}
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            सामाजिक विज्ञान के अध्याय
          </CardTitle>
        </CardHeader>

        {/* अध्याय बटन */}
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialScienceChapters.map((chapter, index) => (
            <Button
              key={index}
              className="w-full text-lg py-6"
              variant={selectedChapter === chapter.url ? "default" : "outline"}
              onClick={() => handleChapterSelect(chapter.url)}
            >
              {chapter.title}
            </Button>
          ))}
        </CardContent>

        {/* पूर्ण-चौड़ाई बटन */}
        <CardFooter className="mt-6">
          <Button asChild className="w-full text-lg py-6" size={"lg"} disabled={!selectedChapter}>
            <Link href={selectedChapterUrl}>अध्याय देखें</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SocialScienceChapterSelector;
