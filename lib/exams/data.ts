// @/lib/exam/data.ts
import type { ExamData } from "@/lib/type/exam";
export const examData: ExamData = {
  exams: [
    {
      id: "scqp09",
      name: "CUET/Computer Science",
      subjects: [
        {
          id: "math",
          name: "Mathematics",
          chapters: [
            {
              id: "real-number",
              name: "Real Numbers",
            },
            {
              id: "algebra",
              name: "Algebra",
            },
            {
              id: "calculus",
              name: "Calculus",
            },
          ],
        },
        {
          id: "physics",
          name: "Physics",
          chapters: [
            {
              id: "mechanics",
              name: "Mechanics",
            },
            {
              id: "thermodynamics",
              name: "Thermodynamics",
            },
          ],
        },
      ],
    },
    {
      id: "neet",
      name: "NEET",
      subjects: [
        {
          id: "biology",
          name: "Biology",
          chapters: [
            {
              id: "cell-biology",
              name: "Cell Biology",
            },
            {
              id: "genetics",
              name: "Genetics",
            },
          ],
        },
        {
          id: "chemistry",
          name: "Chemistry",
          chapters: [
            {
              id: "organic",
              name: "Organic Chemistry",
            },
            {
              id: "inorganic",
              name: "Inorganic Chemistry",
            },
          ],
        },
      ],
    },
    {
      id: "bihar-police",
      name: "Bihar Police Constable",
      subjects: [
        {
          id: "math",
          name: "Mathematics",
          chapters: [
            {
              id: "quadractic-equation",
              name: "Quadratic Equation",
            },
          ],
        },
      ],
    },
  ],
};
