"use client";

import type React from "react";

import { useState } from "react";
import { Book, School, GraduationCap, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoHome } from "react-icons/go";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

type BoardCardData = {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
};

type CategoryCardData = {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  route: string;
};

type Selection = {
  topic: string;
  class: string;
  subject: string;
};

export default function Page() {
  return (
    <ContentLayout title="Sabnam">
      <Breadcrumb className="ml-5 lg:ml-3 mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink aria-current="page" href="/home">
              <GoHome className="text-lg" />
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CardWithForm />
    </ContentLayout>
  );
}

function CardWithForm() {
  const router = useRouter();
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Selection>({
    topic: "",
    class: "",
    subject: "",
  });

  const handleExplore = (topic: string) => {
    if (topic === "Competitive Exams") {
      router.push("/competitive-exams");

      return;
    }

    setCurrentSelection({ topic, class: "", subject: "" });
    setIsClassDialogOpen(true);
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
    router.push(
      `/past10year?topic=${currentSelection.topic}&clas=${currentSelection.class}&subject=${currentSelection.subject}`,
    );
    setIsSubjectDialogOpen(false);
  };

  const handleCategoryClick = (route: string) => {
    router.push(route);
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

  const boardCardsData: BoardCardData[] = [
    {
      title: "NCERT",
      icon: <Book className="h-16 w-16" />,
      iconColor: "text-primary",
    },
    {
      title: "CBSE",
      icon: <School className="h-16 w-16" />,
      iconColor: "text-green-500",
    },
  ];

  const categoryCardsData: CategoryCardData[] = [
    {
      title: "Exams",
      description: "Competitive exams, NEET, CUET & more",
      icon: <GraduationCap className="h-16 w-16" />,
      iconColor: "text-purple-500",
      route: "/exams",
    },
    {
      title: "Board Tests",
      description: "Board exam preparations",
      icon: <School className="h-16 w-16" />,
      iconColor: "text-blue-500",
      route: "/board",
    },
    {
      title: "Subject Tests",
      description: "Practice tests for individual subjects",
      icon: <BookOpen className="h-16 w-16" />,
      iconColor: "text-green-500",
      route: "/subjects",
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
            disabled={!currentSelection.subject}
            onClick={handleFinalSubmit}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="flex flex-col items-center gap-12 p-4">
      {/* First section: Question Bank */}
      <div className="w-full">
        {/* Heading for first section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold">
            Explore Exam Categories
          </h1>
          <p className="text-muted-foreground mt-2">
            Find specialized content for various types of exams
          </p>
        </div>
        {/* New three category cards */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {categoryCardsData.map((card, index) => (
            <Card key={index} className="w-full relative">
              <Badge className="absolute top-2 right-2" variant="secondary">
                Free
              </Badge>
              <CardHeader className="flex items-center justify-center">
                <div className={card.iconColor}>{card.icon}</div>
              </CardHeader>
              <CardContent className="text-center">
                <h2 className="text-xl font-bold">{card.title}</h2>
                <p className="text-muted-foreground mt-2">{card.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleCategoryClick(card.route)}
                >
                  Explore
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <div className="w-full">
        {/* Heading for second section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold">
            10+ Years of Question Bank
          </h1>
          <p className="text-muted-foreground mt-2">
            Start Mock Test for Free. Get Instant Results. Get Detailed
            Analysis.
          </p>
        </div>

        {/* Original two cards (NCERT and CBSE) */}
        <div className="flex flex-col sm:flex-row w-full gap-4">
          {boardCardsData.map((card, index) => (
            <Card key={index} className="w-full sm:w-1/2 relative">
              <Badge className="absolute top-2 right-2" variant="secondary">
                Free
              </Badge>
              <CardHeader className="flex items-center justify-center">
                <div className={card.iconColor}>{card.icon}</div>
              </CardHeader>
              <CardContent className="text-center">
                <h2 className="text-2xl font-bold">{card.title}</h2>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleExplore(card.title)}
                >
                  Explore
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {renderClassDialog()}
      {renderSubjectDialog()}
    </div>
  );
}
