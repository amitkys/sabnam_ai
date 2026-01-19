import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, BookOpen, Calendar, Globe, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { StartTest } from "./_components/start-test-button";

export default async function Page({ params }: { params: { testId: string } }) {


  const { testId } = await params;
  const testPaper = await prisma.testPaper.findUnique({
    where: {
      id: testId
    },
    include: {
      category: true,
      _count: {
        select: { questions: true }
      }
    }
  });

  if (!testPaper) {
    return notFound();
  }

  const handleTestStart = () => {

  }


  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card className="w-full shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={testPaper.isPublished ? "default" : "secondary"} className="uppercase tracking-wider text-xs">
                  {testPaper.isPublished ? "Published" : "Draft"}
                </Badge>
                <Badge variant="outline" className="uppercase tracking-wider text-xs">
                  {testPaper.category.name}
                </Badge>
              </div>
              <CardTitle className="text-h2 text-3xl md:text-4xl font-bold text-primary">
                {testPaper.title}
              </CardTitle>
              <CardDescription className="text-lead text-lg">
                {testPaper.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="p-2 bg-background rounded-full shadow-sm text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm  text-muted-foreground">Duration</p>
                <p className="text-lg font-bold">{testPaper.duration} Minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="p-2 bg-background rounded-full shadow-sm text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm  text-muted-foreground">Total Marks</p>
                <p className="text-lg font-bold">{testPaper.totalMarks} Marks</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="p-2 bg-background rounded-full shadow-sm text-primary">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm  text-muted-foreground">Questions</p>
                <p className="text-lg font-bold">{testPaper._count.questions} Questions</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-h4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {testPaper.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="px-3 py-1 text-sm  uppercase">
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : lang}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-h4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Created At
              </h3>
              <p className="text-p text-muted-foreground">
                {format(new Date(testPaper.createdAt), "PPP")}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-6 pb-8">
          <StartTest testId={testId} />
        </CardFooter>
      </Card>
    </div>
  );
}