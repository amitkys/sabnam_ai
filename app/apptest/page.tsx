"use client";
import QuizInterface from "@/components/quiz/QuizInterface";

const dummyData = {
  testseries: {
    id: crypto.randomUUID(),
    title: "Set 1: Basic Concepts",
    duration: 300,
  },
  questions: [
    {
      id: crypto.randomUUID(),
      text: "What is $2 + 2$?",
      answer: "4",
      options: [
        { id: crypto.randomUUID(), text: "3" },
        { id: crypto.randomUUID(), text: "4" },
        { id: crypto.randomUUID(), text: "5" },
        { id: crypto.randomUUID(), text: "6" },
      ],
    },
    {
      id: crypto.randomUUID(),
      text: "Which of the following is a mammal?",
      answer: "Dolphin",
      options: [
        { id: crypto.randomUUID(), text: "Shark" },
        { id: crypto.randomUUID(), text: "Dolphin" },
        { id: crypto.randomUUID(), text: "Octopus" },
        { id: crypto.randomUUID(), text: "Tuna" },
      ],
    },
    {
      id: crypto.randomUUID(),
      text: "Find the value of $5^0$.",
      answer: "1",
      options: [
        { id: crypto.randomUUID(), text: "0" },
        { id: crypto.randomUUID(), text: "1" },
        { id: crypto.randomUUID(), text: "5" },
        { id: crypto.randomUUID(), text: "Undefined" },
      ],
    },
  ],
};

export default function Page() {
  return <QuizInterface TestSeriesData={dummyData} />;
}
