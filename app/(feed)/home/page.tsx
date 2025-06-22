"use client";

import React from "react";

import { useState } from "react";
import { Book, School, GraduationCap, BookOpen, Trophy, FileText, Search } from "lucide-react";
import { useRouter } from '@bprogress/next/app';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Loader } from "@/components/ui/loader";
import { Command, CommandDialog, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { examData } from "@/lib/exams/data";
import { Button } from "@/components/ui/button";

type CategoryCard = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  route?: string;
  requiresSelection?: boolean;
};

type Selection = {
  topic: string;
  class: string;
  subject: string;
};

export default function Page() {
  const router = useRouter();
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Selection>({
    topic: "",
    class: "",
    subject: "",
  });
  const [loadingCard, setLoadingCard] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = React.useMemo(() => {
    if (!searchQuery) return [];

    const results: Array<{
      type: string;
      exam?: string;
      subject?: string;
      chapter?: string;
      url: string;
    }> = [];

    examData.exams.forEach(exam => {
      if (exam.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({
          type: 'exam',
          exam: exam.name,
          url: `/competitive-exams?type=${exam.id}`
        });
      }

      exam.subjects.forEach(subject => {
        subject.chapters.forEach(chapter => {
          if (chapter.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({
              type: 'chapter',
              exam: exam.name,
              subject: subject.name,
              chapter: chapter.name,
              url: `/competitive-exams?type=${exam.id}&subject=${subject.id}&chapter=${chapter.id}`
            });
          }
        });
      });
    });

    return results;
  }, [searchQuery]);

  const handleCardClick = (card: CategoryCard) => {
    setLoadingCard(card.id);

    if (card.route) {
      setTimeout(() => {
        router.push(card.route!);
        setLoadingCard(null);
      }, 500);
      return;
    }

    if (card.requiresSelection) {
      setCurrentSelection({ topic: card.title, class: "", subject: "" });
      setTimeout(() => {
        setIsClassDialogOpen(true);
        setLoadingCard(null);
      }, 500);
    }
  };

  const handleClassSelect = (value: string) => {
    setCurrentSelection((prev) => ({ ...prev, class: value }));
    setIsClassDialogOpen(false);
    setIsSubjectDialogOpen(true);
  };

  const handleSubjectSelect = (value: string) => {
    setCurrentSelection((prev) => ({ ...prev, subject: value }));
  };

  const handleFinalSubmit = () => {
    setLoadingCard("submit");
    setTimeout(() => {
      const topic = currentSelection.topic.replace(/ /g, '-');
      const subject = currentSelection.subject.replace(/ /g, '-');

      router.push(
        `/past10year?topic=${topic}&clas=${currentSelection.class}&subject=${subject}`
      );

      setIsSubjectDialogOpen(false);
      setLoadingCard(null);
    }, 500);
  };

  const subjects10th = [
    "Science",
    "Math",
    "Hindi",
    "Sanskrit",
    "Urdu",
    "Social Science",
  ];

  const subjects12th = [
    "Physics",
    "Chemistry",
    "Biology",
    "Math",
    "Hindi",
    "English",
  ];

  const categoryCards: CategoryCard[] = [
    {
      id: "board",
      title: "Board Exam Practice",
      description: "Test-series for classes 9-12, across all major boards.",
      icon: <School className="h-8 w-8" />,
      iconColor: "text-green-500",
      route: "/board",
    },
    {
      id: "exams",
      title: "Competitive & Entrance Prep",
      description: "Get ready for ur entrance, academic and competitive exams.",
      icon: <Trophy className="h-8 w-8" />,
      iconColor: "text-yellow-500",
      route: "/exams",
    },
    {
      id: "ncert",
      title: "NCERT",
      description: "10+ years of NCERT questions across all subjects",
      icon: <Book className="h-8 w-8" />,
      iconColor: "text-primary",
      requiresSelection: true,
    },
    {
      id: "cbse",
      title: "CBSE",
      description: "10+ years of CBSE questions across all subjects",
      icon: <GraduationCap className="h-8 w-8" />,
      iconColor: "text-pink-500",
      requiresSelection: true,
    },
  ];

  const renderClassDialog = () => (
    <AlertDialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Select your class</AlertDialogTitle>
          <AlertDialogDescription>
            Choose the class you want to explore for {currentSelection.topic}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Select onValueChange={handleClassSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10th">10th</SelectItem>
            <SelectItem value="12th">12th</SelectItem>
          </SelectContent>
        </Select>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const renderSubjectDialog = () => (
    <AlertDialog
      open={isSubjectDialogOpen}
      onOpenChange={setIsSubjectDialogOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Select your subject</AlertDialogTitle>
          <AlertDialogDescription>
            Choose the subject you want to explore for {currentSelection.topic}{" "}
            {currentSelection.class}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Select onValueChange={handleSubjectSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {(currentSelection.class === "10th"
              ? subjects10th
              : subjects12th
            ).map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!currentSelection.subject || loadingCard === "submit"}
            onClick={handleFinalSubmit}
          >
            {loadingCard === "submit" && (
              <Loader className="mr-1" size="small" variant="spin" />
            )}
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <ContentLayout title="Home">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center py-8">
          <div className="inline-flex items-center gap-4 text-muted-foreground">
            <div className="h-[3px] hidden md:block w-12 bg-gradient-to-r from-transparent via-primary to-border" />
            <span className={`text-2xl md:text-4xl font-extrabold md:font-bold bg-gradient-to-r from-foreground to-foreground/65 bg-clip-text text-transparent`}>
              Be the best — give a test
            </span>
            <div className="h-[3px] w-12 hidden md:block bg-gradient-to-l from-transparent via-primary to-border" />
          </div>
        </div>

        {/* Existing Content */}
        <div className="grid grid-cols-1 gap-6 px-2">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle className={`text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/65 bg-clip-text text-transparent`}>
                Exam Preparations
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-5"> {/* Added px-3 here */}
              {categoryCards.filter(card => card.id === "board" || card.id === "exams").map((card) => (
                <Card
                  key={card.id}
                  className={`
                    cursor-pointer transition-all duration-200 ease-in-out hover:bg-secondary/70`}
                  onClick={() => router.push(`${card.route}`)}
                >
                  <CardContent className="py-3"> {/* Modified padding here */}
                    <div className="space-y-2 md:space-y-3">
                      {/* Icon */}
                      <div className={card.iconColor}>
                        {card.icon}
                      </div>

                      {/* Heading */}
                      <h3 className={`text-lg font-semibold`}>
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className={`text-sm text-muted-foreground`}>
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader>
              <CardTitle className={`text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/65 bg-clip-text text-transparent`}>Question Banks</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-5">
              {categoryCards.filter(card => card.id === "ncert" || card.id === "cbse").map((card) => (
                <Card
                  key={card.id}
                  className={`
                    cursor-pointer transition-all duration-200 ease-in-out hover:bg-secondary/70
                    ${loadingCard === card.id ? 'opacity-60 pointer-events-none' : ''}
                  `}
                  onClick={() => handleCardClick(card)}
                >
                  <CardContent className="py-3">
                    <div className="space-y-3">
                      {/* Icon */}
                      <div className={card.iconColor}>
                        {card.icon}
                      </div>

                      {/* Heading */}
                      <h3 className={`text-lg font-semibold`}>
                        {card.title} questions bank
                      </h3>

                      {/* Description */}
                      <p className={`text-sm text-muted-foreground`}>
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
        {renderClassDialog()}
        {renderSubjectDialog()}
      </div>
    </ContentLayout>
  );
}