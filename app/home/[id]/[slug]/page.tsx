import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

import { getDomainLabel, getLevelLabel, getChildrenHeading } from './_utils/category-labels';
import { CategoryHeader } from './_components/category-header';
import { ChildrenGrid } from './_components/children-grid';
import { TestList } from './_components/test-list';
import { EmptyState } from './_components/empty-state';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Separator } from '@/components/ui/separator';

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export const dynamic = 'force-dynamic';

// ── SEO metadata ───────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!category) return { title: 'Not Found' };
  return {
    title: `${category.name} | Sabnam AI`,
    description: `Practice questions and tests for ${category.name}`,
  };
}

// ── Page ───────────────────────────────────────────────────────
export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      children: { orderBy: { name: 'asc' } },
      tests: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { questions: true } },
        },
      },
      parent: true,
    },
  });

  if (!category) return notFound();

  const hasContent = category.children.length > 0 || category.tests.length > 0;

  return (
    <ContentLayout title={category.name}>
      <div className="flex flex-col gap-8">

        <CategoryHeader
          name={category.name}
          levelLabel={getLevelLabel(category.level)}
          domainLabel={getDomainLabel(category.domain)}
          parent={category.parent}
        />

        <ChildrenGrid
          heading={getChildrenHeading(category.level)}
          children={category.children}
        />
        <Separator />
        <TestList tests={category.tests} />

        {!hasContent && <EmptyState categoryName={category.name} />}

      </div>
    </ContentLayout>);
}