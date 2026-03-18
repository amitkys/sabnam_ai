import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

interface CategoryHeaderProps {
  name: string;
  levelLabel: string;
  domainLabel: string | null;
  parent: { id: string; name: string; slug: string } | null;
}

/**
 * Renders the page header for a category node:
 *  - Back button (pill-style, to parent or all-exams)
 *  - Page title (h1)
 */
export function CategoryHeader({
  name,
  parent,
}: CategoryHeaderProps) {
  const backHref = parent ? `/apptest/${parent.id}/${parent.slug}` : '/apptest';
  const backLabel = parent ? parent.name : 'All Exams';

  return (
    <div className="flex flex-col gap-3">

      {/* Back button — pill style */}
      <Link
        href={backHref}
        className="group bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5  px-3 py-1.5 text-xs font-medium transition-all"
      >
        <ArrowLeftIcon className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
        {backLabel}
      </Link>

      {/* Page title */}
      <h1 className="text-h3">{name}</h1>

    </div>
  );
}
