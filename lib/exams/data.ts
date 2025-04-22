//@lib/exams/data.ts
import type { IExam } from "@/lib/type/exam";

export const exam: IExam = {
  examName: [
    {
      id: "cuet/scqp09",
      name: "CUET/SCQP09",
      subjects: [
        {
          id: "math",
          name: "Mathematics",
          chapters: [
            {
              id: "set-theory",
              name: "Set theory",
            },
            {
              id: "quadratic-equations",
              name: "Quadratic Equations",
            },
          ],
        },
        {
          id: "os",
          name: "Operating System",
          chapters: [
            {
              id: "process-management",
              name: "Process Management",
            },
          ],
        },
      ],
    },
  ],
};
