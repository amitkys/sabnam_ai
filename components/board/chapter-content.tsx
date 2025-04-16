// src/components/education/chapter-content.tsx

import { useState } from "react";
import { BookText } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEducationStore } from "@/lib/store/boardStore";

export function ChapterContent() {
  const [activeTab, setActiveTab] = useState<string>("content");
  const { content, chapterName, subjectName, standardName, boardName } =
    useEducationStore();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookText className="h-5 w-5" />
          <CardTitle>{chapterName}</CardTitle>
        </div>
        <CardDescription>
          {subjectName} | {standardName} | {boardName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="objectives">Learning Objectives</TabsTrigger>
            <TabsTrigger value="practice">Practice Questions</TabsTrigger>
          </TabsList>
          <TabsContent className="mt-0" value="content">
            <ScrollArea className="h-[60vh] rounded-md border p-4">
              <div className="prose dark:prose-invert max-w-none">
                <h2>Chapter Content</h2>
                <p>{content}</p>
                <p>
                  This section would contain detailed explanations of the key
                  concepts related to {chapterName} in {subjectName}.
                </p>
                {/* Additional content sections */}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Objectives and Practice tabs would be structured similarly */}
          <TabsContent className="mt-0" value="objectives">
            {/* Learning objectives content */}
          </TabsContent>

          <TabsContent className="mt-0" value="practice">
            {/* Practice questions content */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
