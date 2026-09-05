import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DOMAIN_META, groupByDomain, getActiveDomains } from './_utils/domain-meta';
import { ContentLayout } from '@/components/admin-panel/content-layout';

export const metadata = {
  title: 'All Exams | Sabnam AI',
  description: 'Browse all exams by category — boards, entrance, competitive, and more.',
};

export const dynamic = 'force-dynamic';

export default async function AppTestPage() {
  const rootCategories = await prisma.category.findMany({
    where: { level: 'ROOT', parentId: null },
    orderBy: { name: 'asc' },
  });

  const grouped = groupByDomain(rootCategories);
  const activeDomains = getActiveDomains(grouped);

  return (
    <ContentLayout title='All Exams'>
      <div className="flex flex-col gap-10">

        {activeDomains.map((domain, idx) => {
          const meta = DOMAIN_META[domain];
          const exams = grouped[domain];

          return (
            <section key={domain}>

              {/* Domain section header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{meta.label}</h2>
                  </div>
                  {/* <p className="text-muted-foreground text-xs truncate">
                  {meta.description}
                </p> */}
                </div>
              </div>

              {/* Exam cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => (
                  <Link key={exam.id} href={`/home/${exam.id}/${exam.slug}`}>
                    <Card className="group bg-primary/5 hover:bg-primary/10">
                      <CardContent className="flex items-center justify-between">
                        {exam.name}
                        <ChevronRightIcon className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Separator between sections — not after the last one */}
              {idx < activeDomains.length - 1 && (
                <Separator className="mt-10" />
              )}
            </section>
          );
        })}

        {/* Empty state */}
        {activeDomains.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center text-sm">
              No exams found.
            </CardContent>
          </Card>
        )}

      </div></ContentLayout>
  );
}