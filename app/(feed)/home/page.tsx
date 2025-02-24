"use client";

import type React from "react"; // Added import for React
import { useState } from "react";
import { Book, GraduationCap, School } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
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

type CardData = {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
};

type Selection = {
  topic: string;
  class: string;
  subject: string;
};

export default function Page() {
  return (
    <ContentLayout title="Sabnam">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" aria-current="page">
              Sabnam
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> 
      <CardWithForm />
    </ContentLayout>
  );
}



function CardWithForm() {
  const router = useRouter(); // Initialize the router
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Selection>({
    topic: "",
    class: "",
    subject: "",
  });

  const handleExplore = (topic: string) => {
    if (topic === "Competitive Exams") {
      // Redirect to a specific page for competitive exams
      router.push("/competitive-exams"); // Replace with your desired route

      return; // Exit the function early
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
    // console.log("Final selection:", currentSelection);
    router.push(
      `/past10year?topic=${currentSelection.topic}&clas=${currentSelection.class}&subject=${currentSelection.subject}`,
    );
    // Here you can perform any action with the final selection data
    setIsSubjectDialogOpen(false);
  };

  const subjects10th = [
    "Physics",
    "Chemistry",
    "Biology",
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

  const cardsData: CardData[] = [
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
    {
      title: "Competitive Exams",
      icon: <GraduationCap className="h-16 w-16" />,
      iconColor: "text-purple-500",
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
            onClick={handleFinalSubmit}
            disabled={!currentSelection.subject} // Disable if no subject selected
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="flex flex-col items-center gap-8 p-4">
      {/* Text Section */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-3xl font-bold">
          10+ Years of Question Bank
        </h1>
        <p className="text-muted-foreground mt-2">
          Start Mock Test for Free. Get Instant Results. Get Detailed Analysis.
        </p>
      </div>

      {/* Cards Section */}
      <div className="flex flex-wrap justify-center gap-4 w-full">
        {cardsData.map((card, index) => (
          <Card key={index} className="w-full sm:w-[350px] relative">
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

      {renderClassDialog()}
      {renderSubjectDialog()}
    </div>
  );
}
