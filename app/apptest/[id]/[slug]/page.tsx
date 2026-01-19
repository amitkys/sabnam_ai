// app/cat/[id]/[slug]/page.tsx
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
    slug: string;
  }
}

// 1. Generate Metadata for SEO (Optional but recommended)
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: { name: true }
  });

  if (!category) return { title: 'Not Found' };

  return {
    title: `${category.name} | Sabnam AI`,
    description: `Practice questions for ${category.name}`,
  };
}

// 2. The Main Page Component
export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;

  // FETCH: Get the category, its children, AND the parent (for the "Back" button)
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      children: {
        orderBy: { name: 'asc' } // Sort A-Z
      },
      tests: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      },
      parent: true, // Fetch parent to generate "Back" link
    }
  });
  console.log(JSON.stringify(category, null, 2))

  if (!category) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">

        {/* === HEADER SECTION === */}
        <div className="mb-8 border-b pb-6">
          {/* Back Button Logic */}
          {category.parent ? (
            <Link
              href={`/apptest/${category.parent.id}/${category.parent.slug}`}
              className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block"
            >
              ← Back to {category.parent.name}
            </Link>
          ) : (
            <Link href="/apptest" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
              ← Back to Home
            </Link>
          )}

          <h1 className="text-h3">{category.name}</h1>
          {/* <p className="text-gray-500 mt-2"> */}
          {/* This visually confirms the type, e.g., "Standard" or "Subject" */}
          {/* Type: <span className="uppercase tracking-wider text-xs font-bold bg-gray-100 px-2 py-1 rounded">{category.type}</span> */}
          {/* </p> */}
        </div>


        {/* === CONTENT SECTION === */}
        {category.children.length > 0 ? (

          /* SCENARIO A: This is a Folder (It has children) */
          <div>
            <h2 className="text-lg font-medium text-muted-foreground mb-4">Select an option:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  // KEY PART: Build the next URL using [ID] + [SLUG]
                  href={`/apptest/${child.id}/${child.slug}`}
                  className="group p-6 border rounded-lg hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg text-card-foreground group-hover:text-primary">
                      {child.name}
                    </span>
                    <span className="text-muted-foreground group-hover:text-primary">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        ) : undefined}

        {/* list down test if exist  */}
        {category.tests.length > 0 ? (
          <>
            <div className='text-h2'>Test series</div>
            <hr className='my-4' />
            {category.tests.map((exam) => (
              <div>
                <Link href={`/new-test/${exam.id}`} className='text-link'>{exam.title}</Link>
              </div>
            ))}
          </>
        ) : undefined}
      </div>
    </main>
  );
}