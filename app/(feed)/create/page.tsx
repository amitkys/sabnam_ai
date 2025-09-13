/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRef } from "react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { Spotlight } from "@/components/ui/spotlight-new";
import { AuroraText } from "@/components/magicui/aurora-text";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import AnimatedGradientTextDemo from "@/components/custom/animated-topage";
import { CreateTest } from "@/lib/actions";
import { ITestSeriesInput } from "@/lib/type";

export default function DifficultySelector() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // const [customInput, setCustomInput] = useState("");
  // const [difficulty, setDifficulty] = useState("");

  const placeholders = [
    "10th ncert math 1st chapter",
    "12th ncert biology 2nd chapter",
    "10th ncert physics 3rd chapter 50 questions",
    "7th ncert math",
  ];

  const handleSubmit = () => {
    toast.info("This feature is under development.");
  };
  const dbFunctionCall = async () => {
    if (!textareaRef.current?.value) {
      toast.error("Please enter valid JSON data.");

      return;
    }

    try {
      const data: ITestSeriesInput = JSON.parse(textareaRef.current.value);

      toast.promise(
        // Your existing CreateTest function wrapped in a promise
        () => CreateTest(data),
        {
          loading: "Creating test...",
          success: () => "Test has been created successfully.",
          error: "Failed to create test",
        },
      );
    } catch (error: any) {
      toast.error("Please enter valid JSON data.");
      throw new Error(error);
    }
  };

  return (
    <div className="h-screen w-full bg-black/96 antialiased bg-grid-white/[0.02] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="my-10">
        <AnimatedGradientTextDemo />
      </div>
      <Spotlight />

      {/* Centered Text */}
      <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-linear-to-b from-neutral-50 to-neutral-400 bg-opacity-50 mb-10">
        <AuroraText>Sabnam</AuroraText> AI
      </h1>

      {/* Wrapped Accordions */}
      <div className="w-full max-w-[600px] space-y-4">
        <Accordion collapsible className="w-full" type="single">
          {/* Custom Input Accordion */}
          <AccordionItem value="textarea">
            <AccordionTrigger>Custom Input</AccordionTrigger>
            <AccordionContent className="m-1">
              <Textarea
                ref={textareaRef}
                className="min-h-[100px] bg-white/10 text-white w-full"
                placeholder="Enter your custom input here..."
              />
              <Button className="w-full mt-3" onClick={dbFunctionCall}>
                Submit
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Quick Input Accordion */}
          <AccordionItem value="input-selector">
            <AccordionTrigger className="text-white">
              Quick Input
            </AccordionTrigger>
            <AccordionContent className="space-y-4 m-1">
              {/* <Select onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="extremely-hard">Extremely Hard</SelectItem>
                </SelectContent>
              </Select> */}

              {/* <PlaceholdersAndVanishInput
                placeholders={placeholders}
                // onChange={(e) => setCustomInput(e.target.value)}
                onSubmit={handleSubmit}
              /> */}

              <Button className="w-full" onClick={handleSubmit}>
                Submit
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
