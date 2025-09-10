// @/lib/board/data.ts
import type { EducationalData } from "@/lib/type/board";

export const boardExam: EducationalData = {
  boards: [
    {
      id: "bseb",
      name: "bseb",
      standards: [
        {
          id: "10th",
          name: "Class 10",
          subjects: [
            {
              id: "math",
              name: "Mathematics",
              chapters: [
                {
                  id: "real-number",
                  name: "1. Real Numbers",
                },
                {
                  id: "polynomials",
                  name: "2. Polynomials",
                },
                {
                  id: "linear-equations-in-two-variables",
                  name: "3. Linear Equations in Two Variables",
                },
                {
                  id: "quadratic-equations",
                  name: "4. Quadratic Equations",
                },
                {
                  id: "ap",
                  name: "5. Arithmetic Progressions",
                },
                {
                  id: "triangles",
                  name: "6. Triangles",
                },
                {
                  id: "coordinate-geometry",
                  name: "7. Coordinate Geometry",
                },
                {
                  id: "trigonometry",
                  name: "8. Introduction to Trigonometry",
                },
                {
                  id: "applications-of-trigonometry",
                  name: "9. Applications of Trigonometry",
                },
                {
                  id: "circles",
                  name: "10. Circles",
                },
                {
                  id: "constructions",
                  name: "11. Constructions",
                },
                {
                  id: "areas-related-to-Circles",
                  name: "12. Areas Related to Circles",
                },
                {
                  id: "surface-areas-and-volumes",
                  name: "13. Surface Areas and Volumes",
                },
                {
                  id: "statistics",
                  name: "14. Statistics",
                },
                {
                  id: "probability",
                  name: "15. Probability",
                },
                {
                  id: "all",
                  name: "Complete Math",
                },
              ],
            },
            {
              id: "physics",
              name: "Physics",
              chapters: [
                {
                  id: "light-reflection-and-refraction",
                  name: "1. Light: Reflection & Refraction",
                },
                {
                  id: "refraction-of-light",
                  name: "2. Refraction of Light",
                },
                {
                  id: "human-eye-and-colourful-world",
                  name: "3. Human Eye and the Colourful World",
                },
                {
                  id: "electricity",
                  name: "4. Electricity",
                },
                {
                  id: "magnetic-effects-of-electric-current",
                  name: "5. Magnetic Effects of Electric Current",
                },
                {
                  id: "all",
                  name: "Complete Physics",
                },
              ],
            },
            {
              id: "chemistry",
              name: "Chemistry",
              chapters: [
                {
                  id: "chemical-reactions-and-equations",
                  name: "1. Chemical Reactions and Equations",
                },
                {
                  id: "acids-bases-and-salts",
                  name: "2. Acids, Bases and Salts",
                },
                {
                  id: "metals-and-non-metals",
                  name: "3. Metals and Non-metals",
                },
                {
                  id: "carbon-and-its-compounds",
                  name: "4. Carbon and its Compounds",
                },
                {
                  id: "periodic-classification-of-elements",
                  name: "5. Periodic Classification of Elements",
                },
                {
                  id: "all",
                  name: "Complete Chemistry",
                },
              ],
            },
            {
              id: "biology",
              name: "Biology",
              chapters: [
                {
                  id: "life-processes",
                  name: "1. Life Processes",
                },
                {
                  id: "control-and-coordination",
                  name: "2. Control and Coordination",
                },
                {
                  id: "how-do-organisms-reproduce",
                  name: "3. How do Organisms Reproduce?",
                },
                {
                  id: "heredity-and-evolution",
                  name: "4. Heredity and Evolution",
                },
                {
                  id: "our-environment",
                  name: "5. Our Environment",
                },
                {
                  id: "management-of-natural-resources",
                  name: "6. Management of Natural Resources",
                },
                {
                  id: "all",
                  name: "Complete Biology",
                },
              ],
            },

            // {
            //   id: "english",
            //   name: "English",
            //   chapters: [
            //     {
            //       id: "prose",
            //       name: "Prose",
            //     },
            //     {
            //       id: "poetry",
            //       name: "Poetry",
            //     },
            //     {
            //       id: "grammar",
            //       name: "Grammar",
            //     },
            //   ],
            // },
            {
              id: "hindi",
              name: "Hindi",
              chapters: [
                {
                  id: "shram-vibhajan-aur-jati-pratha",
                  name: "श्रम विभाजन और जाति प्रथा",
                },
                {
                  id: "vish-ke-daant",
                  name: "विष के दाँत",
                },
              ],
            },
          ],
        },
        {
          id: "12th",
          name: "Class 12",
          subjects: [
            {
              id: "math",
              name: "Mathematics",
              chapters: [
                {
                  id: "relations-functions",
                  name: "Relations and Functions",
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
                  id: "electrostatics",
                  name: "Electrostatics",
                },
                {
                  id: "magnetism",
                  name: "Magnetism and Matter",
                },
                {
                  id: "optics",
                  name: "Optics",
                },
              ],
            },
          ],
        },
        {
          id: "8th",
          name: "Class 8",
          subjects: [
            {
              id: "math",
              name: "Mathematics",
              chapters: [
                {
                  id: "linear-equation-in-one-variable",
                  name: "Linear Equation in One Variable",
                },
                {
                  id: "square-and-square-root",
                  name: "Square and Square Root",
                },
                {
                  id: "cube-and-cube-root",
                  name: "Cube and Cube Root",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "cbse",
      name: "cbse",
      standards: [
        {
          id: "10th",
          name: "Class 10",
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
                  id: "polynomials",
                  name: "Polynomials",
                },
                {
                  id: "coordinate-geometry",
                  name: "Coordinate Geometry",
                },
              ],
            },
            {
              id: "science",
              name: "Science",
              chapters: [
                {
                  id: "chemical-reactions",
                  name: "Chemical Reactions and Equations",
                },
                {
                  id: "human-eye",
                  name: "The Human Eye and Colorful World",
                },
              ],
            },
          ],
        },
        {
          id: "12th",
          name: "Class 12",
          subjects: [
            {
              id: "math",
              name: "Mathematics",
              chapters: [
                {
                  id: "matrices",
                  name: "Matrices",
                },
                {
                  id: "determinants",
                  name: "Determinants",
                },
              ],
            },
            {
              id: "chemistry",
              name: "Chemistry",
              chapters: [
                {
                  id: "solid-state",
                  name: "The Solid State",
                },
                {
                  id: "solutions",
                  name: "Solutions",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
