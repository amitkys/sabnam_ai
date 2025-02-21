/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spotlight } from "@/components/ui/spotlight-new";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { AuroraText } from "@/components/magicui/aurora-text";
import {
  Accordion,
  AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Data } from "@/lib/type";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AnimatedGradientTextDemo from "@/components/custom/animated-topage";
import { CreateTest } from "@/lib/actions";


export default function DifficultySelector() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // const [customInput, setCustomInput] = useState("");
  // const [difficulty, setDifficulty] = useState("");
  const { toast } = useToast();

  const placeholders = [
    "10th ncert math 1st chapter",
    "12th ncert biology 2nd chapter",
    "10th ncert physics 3rd chapter 50 questions",
    "7th ncert math",
  ];

  // const handleSelectChange = (value: string) => {
  //   setDifficulty(value);
  // };

  const handleSubmit = () => {
    toast({
      title: "Feature not implemented",
      description: "Will be implemented soon.. because this is paid",
    });
  };
  const dbFunctionCall = async () => {
    if (!textareaRef.current?.value) {
      toast({
        title: "Error",
        description: "Input field is empty. Please enter some data.",
        variant: "destructive",
      });

      return;
    }

    try {
      const data: Data = JSON.parse(textareaRef.current.value);
      await CreateTest(data);
      toast({title: "Test Created", description: "Test has been created successfully."});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error.message)
      toast({
        title: "Invalid JSON Format",
        description: "Please enter valid JSON data.",
        variant: "destructive",
      });
      // console.error("JSON Parse Error:", error);
    }
  };

  return (
    <div className="h-screen w-full bg-black/[0.96] antialiased bg-grid-white/[0.02] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="my-10">
        <AnimatedGradientTextDemo />
      </div>
      <Spotlight />

      {/* Centered Text */}
      <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 mb-10">
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
