import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function Page() {
  const exams = await prisma.category.findMany({
    where: {
      parentId: null
    }
  })


  return (
    <div className="flex flex-col gap-2">
      {exams.map((exam) => (
        <Link className="text-link" href={`/apptest/${exam.id}/${exam.slug}`}>
          {exam.name}
        </Link>
      ))}
    </div>
  )
}