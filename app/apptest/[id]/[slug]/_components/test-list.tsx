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

import { StartTestButton } from './start-test-button';

interface TestPaper {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  totalMarks: number;
  languages: string[];
  _count: {
    questions: number;
  };
}

interface TestListProps {
  tests: TestPaper[];
}

/**
 * Renders a list of published test paper cards.
 * Each card shows the title, description, duration, total marks,
 * and a "Start" button that opens the attempt page directly.
 * Shown only when at least one published test exists.
 */
export function TestList({ tests }: TestListProps) {
  if (tests.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h3 className='text-h3'>Available Tests</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <Card
            key={test.id}
            className="group flex flex-col"
          >
            <CardHeader className="pb-3 flex-1">
              <div className="flex flex-col min-w-0">
                <CardTitle className="body">
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
                <span className="text-muted-foreground flex items-center gap-1.5 caption">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {test.duration} min
                </span>
                <span className="text-muted-foreground flex items-center gap-1.5 caption">
                  <FileTextIcon className="h-3.5 w-3.5" />
                  {test.totalMarks} marks
                </span>
              </div>
            </CardContent>

            <CardFooter>
              <StartTestButton testId={test.id} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

