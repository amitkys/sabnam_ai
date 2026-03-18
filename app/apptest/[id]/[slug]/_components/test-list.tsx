import Link from 'next/link';
import { ClockIcon, FileTextIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TestPaper {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  totalMarks: number;
}

interface TestListProps {
  tests: TestPaper[];
}

/**
 * Renders a list of published test paper cards.
 * Each card shows the title, description, duration, total marks,
 * and a "Start" button that navigates to the test attempt page.
 * Shown only when at least one published test exists.
 */
export function TestList({ tests }: TestListProps) {
  if (tests.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h4">Available Tests</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <Card
            key={test.id}
            className="group flex flex-col"
          >
            <CardHeader className="pb-3 flex-1">
              <div className="flex flex-col min-w-0">
                <CardTitle className="text-base">
                  {test.title}
                </CardTitle>
                {test.description && (
                  <CardDescription className="mt-1 line-clamp-2">
                    {test.description}
                  </CardDescription>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4">
              <div className="flex gap-4">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {test.duration} min
                </span>
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <FileTextIcon className="h-3.5 w-3.5" />
                  {test.totalMarks} marks
                </span>
              </div>
            </CardContent>

            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/new-test/${test.id}`}>Start →</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
