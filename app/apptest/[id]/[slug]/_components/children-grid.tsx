import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryLevel } from '@/lib/generated/prisma/enums';

interface ChildCategory {
  id: string;
  name: string;
  slug: string;
  level: CategoryLevel;
}

interface ChildrenGridProps {
  heading: string;
  children: ChildCategory[];
}

/**
 * Renders the drill-down navigation grid.
 * Each card links deeper into the category tree.
 * Shown only when the current node has child categories.
 */
export function ChildrenGrid({ heading, children }: ChildrenGridProps) {
  if (children.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h4">{heading}</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => (
          <Link key={child.id} href={`/apptest/${child.id}/${child.slug}`}>
            <Card className="group hover:bg-primary/10">
              <CardContent className="flex items-center font-mono justify-between px-5 py-4">
                {child.name}
                <ChevronRightIcon className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
