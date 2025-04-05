import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ISubject } from "@/lib/type";

export default function SubjectNotFound({ subjectName }: ISubject) {
  return (
    <div className="text-center mt-10 text-red-600 font-semibold text-xl">
      Sorry, we couldn’t find chapters for subject "
      <span className="capitalize">{subjectName}</span>".
      <div className="mt-4">
        <Link href="/bseb/10th">
          <Button variant="outline">Back to Subjects</Button>
        </Link>
      </div>
    </div>
  );
}
