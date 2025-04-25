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
    {
      id: "cs",
      name: "Computer Science",
      subjects: [
        {
          id: "os",
          name: "Operating System",
          chapters: [
            {
              id: "process-management",
              name: "Process Management",
            },
            {
              id: "memory-management",
              name: "Memory Management",
            },
            {
              id: "file-management",
              name: "File Management",
            },
            {
              id: "cpu-scheduling",
              name: "CPU Scheduling",
            },
          ],
        },
        {
          id: "ds",
          name: "Data Structure",
          chapters: [
            {
              id: "array",
              name: "Array",
            },
            {
              id: "link-list",
              name: "Link List",
            },
            {
              id: "stack",
              name: "Stack",
            },
            {
              id: "queue",
              name: "Queue",
            },
          ],
        },
        {
          id: "networking",
          name: "Computer Networking",
          chapters: [
            {
              id: "network-topology",
              name: "Network Topology",
            },
            {
              id: "packet-switching",
              name: "Packet Switching",
            },
            {
              id: "circuit-switching",
              name: "Circuit Switching",
            },
          ],
        },
        {
          id: "db",
          name: "Data Base Management System",
          chapters: [
            {
              id: "into",
              name: "Introduction to Database Management System",
            },
            {
              id: "normalization",
              name: "Normalization",
            },
          ],
        },
      ],
    },
  ],
};
