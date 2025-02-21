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

// Static data for subjects
const subjects = [
  {
    title: "Physics",
    url: "/ncert/10th/physics", // Updated URL
  },
  {
    title: "Chemistry",
    url: "/ncert/10th/chemistry", // Updated URL
  },
  {
    title: "Biology",
    url: "/ncert/10th/biology", // Updated URL
  },
  {
    title: "Math",
    url: "/ncert/10th/math", // Updated URL
  },
  {
    title: "Hindi",
    url: "/ncert/10th/hindi", // Updated URL
  },
  {
    title: "Sanskrit",
    url: "/ncert/10th/sanskrit", // Updated URL
  },
  {
    title: "Social Science",
    url: "/ncert/10th/social-science", // Updated URL
  },
];

const SubjectSelector = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Handle subject selection
  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
  };

  // Get the URL for the selected subject
  const selectedSubjectUrl =
    subjects.find((sub) => sub.title === selectedSubject)?.url || "#";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Large Card */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Choose Subject
          </CardTitle>
        </CardHeader>

        {/* Small Buttons for Subjects */}
        <CardContent className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {subjects.map((subject, index) => (
            <Button
              key={index}
              className="w-full text-lg py-6"
              variant={
                selectedSubject === subject.title ? "default" : "outline"
              }
              onClick={() => handleSubjectSelect(subject.title)}
            >
              {subject.title}
            </Button>
          ))}
        </CardContent>

        {/* Full-width Button */}
        <CardFooter className="mt-6">
          {selectedSubject ? (
            <Button asChild className="w-full text-lg py-6" size={"lg"}>
              <Link href={selectedSubjectUrl}>Explore {selectedSubject}</Link>
            </Button>
          ) : (
            <Button disabled className="w-full text-lg py-6" size={"lg"}>
              Explore Subject
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubjectSelector;
