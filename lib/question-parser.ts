import { QuestionType, Difficulty } from "@/lib/generated/prisma/enums";

export interface NormalizedOption {
  id: string; // "A", "B", "C", "D", etc.
  text: {
    en: string;
    hi: string;
  };
  isCorrect: boolean;
}

export interface NormalizedQuestion {
  content: {
    en: string;
    hi: string;
  };
  type: QuestionType;
  difficulty: Difficulty;
  options: NormalizedOption[];
  correctValue: string; // e.g. "B" or "45" or "A,B"
  solution: {
    en: string;
    hi: string;
  };
  positiveMarks: number;
  negativeMarks: number;
  imageUrl?: string | null;
  tags?: string[];
  section?: string | null; // e.g. "Mathematics", "Science", "Reasoning"
  sectionId?: string | null; // Database ID if linked to an existing TestSection
}

export interface NormalizedSection {
  id?: string;
  name: string;
  orderIndex: number;
  description?: string | null;
  duration?: number | null;
  questions: NormalizedQuestion[];
}

export interface ParsedJSONResult {
  success: boolean;
  error?: string;
  metadata?: {
    title?: string;
    duration?: number;
    description?: string;
    languages?: string[];
    isPublic?: boolean;
    level?: string;
  };
  sections?: NormalizedSection[];
  questions: NormalizedQuestion[];
}

/**
 * Ensures a question markdown text begins with `##### `
 */
function ensureH5Prefix(text: string): string {
  if (!text) return "##### ";
  const trimmed = text.trim();
  if (trimmed.startsWith("#####")) return trimmed;
  // If it starts with another heading like ### or #
  if (/^#{1,6}\s+/.test(trimmed)) {
    return trimmed.replace(/^#{1,6}\s+/, "##### ");
  }
  return `##### ${trimmed}`;
}

/**
 * Converts a string or multi-lingual object to { en, hi }
 */
function toBilingualText(val: unknown): { en: string; hi: string } {
  if (!val) return { en: "", hi: "" };
  if (typeof val === "string") {
    return { en: val, hi: val };
  }
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    const en = String(obj.en ?? obj.english ?? obj.text ?? "");
    const hi = String(obj.hi ?? obj.hindi ?? obj.en ?? obj.text ?? "");
    return { en: en || hi, hi: hi || en };
  }
  return { en: String(val), hi: String(val) };
}

/**
 * Normalizes options from various common structures
 */
function normalizeOptions(
  rawOptions: unknown,
  answerIndex?: number | null,
  correctValue?: string | null,
  answerText?: string | null
): NormalizedOption[] {
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
    return [];
  }

  const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return rawOptions.map((opt, idx) => {
    const letter = optionLetters[idx] || String(idx + 1);

    // Shape 1: Simple string: "Option text"
    if (typeof opt === "string") {
      const isCorrect =
        answerIndex === idx ||
        correctValue === letter ||
        (Boolean(answerText) && opt.trim().toLowerCase() === String(answerText).trim().toLowerCase());

      return {
        id: letter,
        text: { en: opt, hi: opt },
        isCorrect: Boolean(isCorrect),
      };
    }

    // Shape 2: Object: { en: "...", hi: "..." } or { text: { en, hi }, isCorrect } or { id, text, isCorrect }
    if (typeof opt === "object" && opt !== null) {
      const optObj = opt as Record<string, unknown>;
      const id = String(optObj.id || letter).toUpperCase();

      let textObj: { en: string; hi: string };

      if (optObj.text && typeof optObj.text === "object") {
        textObj = toBilingualText(optObj.text);
      } else if (typeof optObj.text === "string") {
        textObj = { en: optObj.text, hi: optObj.text };
      } else if (optObj.en || optObj.hi) {
        textObj = toBilingualText(optObj);
      } else {
        textObj = { en: String(optObj.value || optObj.label || ""), hi: String(optObj.value || optObj.label || "") };
      }

      // Check correctness
      let isCorrect = Boolean(optObj.isCorrect);

      if (!isCorrect) {
        if (answerIndex !== undefined && answerIndex !== null && answerIndex === idx) {
          isCorrect = true;
        } else if (correctValue && correctValue.toUpperCase().split(",").map((s) => s.trim()).includes(id)) {
          isCorrect = true;
        } else if (answerText && (textObj.en.trim() === answerText.trim() || textObj.hi.trim() === answerText.trim())) {
          isCorrect = true;
        }
      }

      return {
        id,
        text: textObj,
        isCorrect,
      };
    }

    return {
      id: letter,
      text: { en: String(opt), hi: String(opt) },
      isCorrect: false,
    };
  });
}

/**
 * Normalizes a single raw question object into NormalizedQuestion
 */
export function normalizeSingleQuestion(rawQ: Record<string, unknown>, index: number = 0): NormalizedQuestion {
  // Extract content
  let rawContent: unknown = rawQ.content ?? rawQ.text ?? rawQ.question ?? "";
  const contentBilingual = toBilingualText(rawContent);

  contentBilingual.en = ensureH5Prefix(contentBilingual.en);
  contentBilingual.hi = ensureH5Prefix(contentBilingual.hi);

  // Extract answer info
  const answerIndex = typeof rawQ.answerIndex === "number" ? rawQ.answerIndex : undefined;
  const rawCorrectValue = rawQ.correctValue ? String(rawQ.correctValue) : undefined;
  const rawAnswerText = rawQ.answer ? String(rawQ.answer) : undefined;

  // Options
  const rawOptions = rawQ.options ?? rawQ.choices ?? [];
  const options = normalizeOptions(rawOptions, answerIndex, rawCorrectValue, rawAnswerText);

  // Determine correctValue
  let correctValue = rawCorrectValue || "";
  if (!correctValue) {
    const correctOptions = options.filter((o) => o.isCorrect);
    if (correctOptions.length > 0) {
      correctValue = correctOptions.map((o) => o.id).join(",");
    } else if (answerIndex !== undefined && options[answerIndex]) {
      correctValue = options[answerIndex].id;
      options[answerIndex].isCorrect = true;
    } else if (rawAnswerText) {
      correctValue = rawAnswerText;
    }
  }

  // Type
  let type: QuestionType = QuestionType.MCQ_SINGLE;
  if (rawQ.type) {
    const typeStr = String(rawQ.type).toUpperCase();
    if (typeStr.includes("MULTIPLE") || typeStr === "MCQ_MULTIPLE") {
      type = QuestionType.MCQ_MULTIPLE;
    } else if (typeStr.includes("NUMERICAL") || typeStr === "NUMERICAL") {
      type = QuestionType.NUMERICAL;
    } else if (typeStr.includes("INTEGER") || typeStr === "INTEGER") {
      type = QuestionType.INTEGER;
    }
  } else if (options.filter((o) => o.isCorrect).length > 1) {
    type = QuestionType.MCQ_MULTIPLE;
  } else if (options.length === 0 && correctValue) {
    type = isNaN(Number(correctValue)) ? QuestionType.NUMERICAL : QuestionType.INTEGER;
  }

  // Difficulty
  let difficulty: Difficulty = Difficulty.MEDIUM;
  if (rawQ.difficulty) {
    const diffStr = String(rawQ.difficulty).toUpperCase();
    if (diffStr === "EASY") difficulty = Difficulty.EASY;
    else if (diffStr === "HARD") difficulty = Difficulty.HARD;
  }

  // Solution / Explanation
  const solutionBilingual = toBilingualText(rawQ.solution ?? rawQ.explanation ?? rawQ.hint ?? "");

  // Marks
  const positiveMarks = typeof rawQ.marks === "number" ? rawQ.marks : typeof rawQ.positiveMarks === "number" ? rawQ.positiveMarks : 1;
  const negativeMarks = typeof rawQ.negativeMarks === "number" ? rawQ.negativeMarks : 0;

  return {
    content: contentBilingual,
    type,
    difficulty,
    options,
    correctValue: correctValue || "A",
    solution: solutionBilingual,
    positiveMarks: Math.max(0, positiveMarks),
    negativeMarks: Math.max(0, negativeMarks),
    imageUrl: typeof rawQ.imageUrl === "string" ? rawQ.imageUrl : null,
    tags: Array.isArray(rawQ.tags) ? rawQ.tags.map(String) : [],
    section:
      typeof rawQ.section === "string" && rawQ.section.trim()
        ? rawQ.section.trim()
        : typeof rawQ.sectionName === "string" && rawQ.sectionName.trim()
        ? rawQ.sectionName.trim()
        : null,
    sectionId:
      typeof rawQ.sectionId === "string" && rawQ.sectionId.trim()
        ? rawQ.sectionId.trim()
        : null,
  };
}

/**
 * Parses user input JSON string into a structured test & question list.
 * Supports complete wrappers, arrays, and loose/comma-separated JSON objects.
 */
export function parseMarkdownJSON(input: string): ParsedJSONResult {
  if (!input || !input.trim()) {
    return {
      success: false,
      error: "Input text is empty. Please paste valid JSON.",
      questions: [],
    };
  }

  const trimmed = input.trim();
  let parsedObject: any;

  // 1. Try parsing as standard JSON
  try {
    parsedObject = JSON.parse(trimmed);
  } catch (err: any) {
    // 2. If it failed, try wrapping comma-separated or line-separated objects into an array
    try {
      // Clean trailing comma if any
      const cleaned = trimmed.replace(/,\s*$/, "");
      parsedObject = JSON.parse(`[${cleaned}]`);
    } catch {
      // 3. Try fixing unescaped backslashes commonly generated by LaTeX in raw strings
      try {
        const sanitized = trimmed.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
        parsedObject = JSON.parse(sanitized);
      } catch (finalErr: any) {
        return {
          success: false,
          error: `Invalid JSON syntax: ${err.message}`,
          questions: [],
        };
      }
    }
  }

  let metadata: ParsedJSONResult["metadata"] = undefined;
  let rawSectionsList: any[] = [];
  let rawQuestionsList: any[] = [];

  // Shape 1: { testseries: { ... }, sections: [...], questions: [...] }
  if (parsedObject && typeof parsedObject === "object" && !Array.isArray(parsedObject)) {
    if (parsedObject.testseries && typeof parsedObject.testseries === "object") {
      const ts = parsedObject.testseries;
      metadata = {
        title: ts.title || ts.name,
        duration: typeof ts.duration === "number" ? ts.duration : undefined,
        description: ts.description || ts.exactName,
        languages: Array.isArray(ts.availableLanguage) ? ts.availableLanguage : ["en", "hi"],
        isPublic: typeof ts.isPublic === "boolean" ? ts.isPublic : true,
      };

      if (Array.isArray(ts.sections)) {
        rawSectionsList = ts.sections;
      } else if (Array.isArray(ts.questions)) {
        rawQuestionsList = ts.questions;
      }
    }

    if (Array.isArray(parsedObject.sections)) {
      rawSectionsList = parsedObject.sections;
    } else if (Array.isArray(parsedObject.questions)) {
      rawQuestionsList = parsedObject.questions;
    } else if (rawQuestionsList.length === 0 && rawSectionsList.length === 0 && (parsedObject.text || parsedObject.content)) {
      // Single question object
      rawQuestionsList = [parsedObject];
    }
  } else if (Array.isArray(parsedObject)) {
    // Shape 2: Array of questions [ {...}, {...} ]
    rawQuestionsList = parsedObject;
  }

  // Branch A: Sectional JSON provided ({ sections: [ { name, questions: [...] } ] })
  if (rawSectionsList.length > 0) {
    const normalizedSections: NormalizedSection[] = [];
    const allQuestions: NormalizedQuestion[] = [];

    rawSectionsList.forEach((rawSec, secIdx) => {
      if (!rawSec || typeof rawSec !== "object") return;
      const secName = String(rawSec.name || rawSec.title || `Section ${secIdx + 1}`).trim();
      const secDesc = typeof rawSec.description === "string" ? rawSec.description : null;
      const secDuration = typeof rawSec.duration === "number" ? rawSec.duration : null;
      const secRawQs = Array.isArray(rawSec.questions) ? rawSec.questions : [];

      const secQuestions: NormalizedQuestion[] = secRawQs
        .filter((q: any) => q && typeof q === "object")
        .map((q: any, qIdx: number) => {
          const normQ = normalizeSingleQuestion(q, qIdx);
          normQ.section = normQ.section || secName;
          if (rawSec.id) normQ.sectionId = normQ.sectionId || String(rawSec.id);
          return normQ;
        });

      normalizedSections.push({
        id: typeof rawSec.id === "string" ? rawSec.id : undefined,
        name: secName,
        orderIndex: secIdx + 1,
        description: secDesc,
        duration: secDuration,
        questions: secQuestions,
      });

      allQuestions.push(...secQuestions);
    });

    if (allQuestions.length === 0) {
      return {
        success: false,
        error: "No question objects found inside the sections. Make sure each section contains a questions array.",
        questions: [],
      };
    }

    return {
      success: true,
      metadata,
      sections: normalizedSections,
      questions: allQuestions,
    };
  }

  // Branch B: Flat questions list
  if (rawQuestionsList.length === 0) {
    return {
      success: false,
      error: "No question objects found in the JSON. Make sure your JSON contains an array of questions or sections.",
      questions: [],
    };
  }

  // Normalize each question
  const questions: NormalizedQuestion[] = rawQuestionsList
    .filter((q) => q && typeof q === "object")
    .map((q, idx) => normalizeSingleQuestion(q, idx));

  // Check if any questions have section specified
  const distinctSections = Array.from(new Set(questions.map((q) => q.section).filter(Boolean))) as string[];
  let sections: NormalizedSection[] | undefined = undefined;

  if (distinctSections.length > 0) {
    sections = distinctSections.map((secName, idx) => {
      const secQuestions = questions.filter((q) => q.section === secName);
      return {
        name: secName,
        orderIndex: idx + 1,
        questions: secQuestions,
      };
    });
  }

  return {
    success: true,
    metadata,
    sections,
    questions,
  };
}

/**
 * Bilingual sample template JSON (English + Hindi with LaTeX math)
 */
export const SAMPLE_BILINGUAL_JSON = JSON.stringify(
  {
    testseries: {
      title: "Class 10 Mathematics - Trigonometry & Real Numbers Mock Test",
      duration: 90,
      description: "Comprehensive bilingual practice paper covering Trigonometry and Real Numbers with LaTeX formulas.",
    },
    questions: [
      {
        text: {
          en: "##### What is the exact value of $\\sin(90^\\circ) + \\cos(0^\\circ)$?",
          hi: "##### $\\sin(90^\\circ) + \\cos(0^\\circ)$ का सटीक मान क्या है?"
        },
        answerIndex: 1,
        options: [
          { en: "$0$", hi: "$0$" },
          { en: "$2$", hi: "$2$" },
          { en: "$1$", hi: "$1$" },
          { en: "$\\sqrt{2}$", hi: "$\\sqrt{2}$" }
        ],
        solution: {
          en: "We know that $\\sin(90^\\circ) = 1$ and $\\cos(0^\\circ) = 1$. Therefore:\n$$\\sin(90^\\circ) + \\cos(0^\\circ) = 1 + 1 = 2$$",
          hi: "हम जानते हैं कि $\\sin(90^\\circ) = 1$ और $\\cos(0^\\circ) = 1$ होता है। अतः:\n$$\\sin(90^\\circ) + \\cos(0^\\circ) = 1 + 1 = 2$$"
        },
        marks: 2,
        negativeMarks: 0.5,
        type: "MCQ_SINGLE",
        difficulty: "EASY"
      },
      {
        text: {
          en: "##### If $\\tan(\\theta) = 1$, find the value of $\\theta$ in degrees for $0^\\circ < \\theta < 90^\\circ$.",
          hi: "##### यदि $\\tan(\\theta) = 1$ हो, तो $0^\\circ < \\theta < 90^\\circ$ के लिए $\\theta$ का मान क्या होगा?"
        },
        answerIndex: 2,
        options: [
          { en: "$30^\\circ$", hi: "$30^\\circ$" },
          { en: "$60^\\circ$", hi: "$60^\\circ$" },
          { en: "$45^\\circ$", hi: "$45^\\circ$" },
          { en: "$90^\\circ$", hi: "$90^\\circ$" }
        ],
        solution: {
          en: "The angle whose tangent is 1 is $\\theta = 45^\\circ$ (or $\\frac{\\pi}{4}$ radians).",
          hi: "जिस कोण का स्पर्शज्या (tan) 1 होता है वह $\\theta = 45^\\circ$ है।"
        },
        marks: 2,
        negativeMarks: 0,
        type: "MCQ_SINGLE",
        difficulty: "EASY"
      },
      {
        text: {
          en: "##### Which of the following numbers are irrational?",
          hi: "##### निम्नलिखित में से कौन सी संख्याएँ अपरिमेय हैं?"
        },
        options: [
          { id: "A", text: { en: "$\\sqrt{2}$", hi: "$\\sqrt{2}$" }, isCorrect: true },
          { id: "B", text: { en: "$\\pi$", hi: "$\\pi$" }, isCorrect: true },
          { id: "C", text: { en: "$\\dfrac{22}{7}$", hi: "$\\dfrac{22}{7}$" }, isCorrect: false },
          { id: "D", text: { en: "$0.333\\dots$", hi: "$0.333\\dots$" }, isCorrect: false }
        ],
        solution: {
          en: "$\\sqrt{2}$ and $\\pi$ are irrational numbers, while $\\dfrac{22}{7}$ and repeating decimals are rational.",
          hi: "$\\sqrt{2}$ और $\\pi$ अपरिमेय संख्याएँ हैं, जबकि $\\dfrac{22}{7}$ परिमेय संख्या है।"
        },
        marks: 4,
        negativeMarks: 1,
        type: "MCQ_MULTIPLE",
        difficulty: "MEDIUM"
      }
    ]
  },
  null,
  2
);

/**
 * Single language sample template JSON (Simple strings with LaTeX math)
 */
export const SAMPLE_SINGLE_LANG_JSON = JSON.stringify(
  {
    testseries: {
      title: "Class 10 Mathematics - Quick Algebra & Calculus Quiz",
      duration: 60,
      description: "Standard single language practice test with algebra and calculus problems.",
    },
    questions: [
      {
        text: "##### If $2x + 5 = 15$, what is the value of $x$?",
        answerIndex: 1,
        options: [
          "$3$",
          "$5$",
          "$10$",
          "$7$"
        ],
        solution: "Subtract 5 from both sides: $2x = 10 \\implies x = 5$.",
        marks: 2,
        negativeMarks: 0.5,
        type: "MCQ_SINGLE",
        difficulty: "EASY"
      },
      {
        text: "##### Find the roots of the quadratic equation: $x^2 - 5x + 6 = 0$.",
        answerIndex: 0,
        options: [
          "$x = 2, 3$",
          "$x = -2, -3$",
          "$x = 1, 6$",
          "$x = -1, -6$"
        ],
        solution: "Factorizing: $(x-2)(x-3) = 0 \\implies x = 2 \\text{ or } x = 3$.",
        marks: 4,
        negativeMarks: 1,
        type: "MCQ_SINGLE",
        difficulty: "MEDIUM"
      },
      {
        text: "##### What is the derivative of $\\sin(x) \\cdot e^x$ with respect to $x$?",
        answerIndex: 2,
        options: [
          "$\\cos(x) \\cdot e^x$",
          "$\\sin(x) \\cdot e^x$",
          "$e^x (\\sin(x) + \\cos(x))$",
          "$e^x (\\sin(x) - \\cos(x))$"
        ],
        solution: "Using the product rule: $\\frac{d}{dx}[u \\cdot v] = u'v + uv'$.\n$$\\frac{d}{dx}[\\sin(x) e^x] = \\cos(x) e^x + \\sin(x) e^x = e^x(\\sin(x) + \\cos(x))$$",
        marks: 4,
        negativeMarks: 1,
        type: "MCQ_SINGLE",
        difficulty: "HARD"
      }
    ]
  },
  null,
  2
);

/**
 * Sectional sample template JSON (Math, Science, Reasoning with LaTeX math & bilingual content)
 */
export const SAMPLE_SECTIONAL_JSON = JSON.stringify(
  {
    testseries: {
      title: "Combined Sectional Mock Test (Math, Science & Reasoning)",
      duration: 90,
      description: "Full multi-section practice test with Quantitative Aptitude, General Science, and Logical Reasoning.",
    },
    sections: [
      {
        name: "General Intelligence & Reasoning",
        description: "Logical and analytical reasoning problems.",
        questions: [
          {
            text: {
              en: "##### Select the related word from the given alternatives:\n\n**Book : Author :: Film : ?**",
              hi: "##### दिए गए विकल्पों में से संबंधित शब्द चुनिए:\n\n**पुस्तक : लेखक :: फिल्म : ?**",
            },
            answerIndex: 1,
            options: [
              { en: "Actor", hi: "अभिनेता" },
              { en: "Director", hi: "निर्देशक" },
              { en: "Producer", hi: "निर्माता" },
              { en: "Screenplay", hi: "पटकथा" },
            ],
            solution: {
              en: "An author creates a book; similarly, a director directs a film.",
              hi: "जिस प्रकार लेखक पुस्तक की रचना करता है, उसी प्रकार निर्देशक फिल्म का निर्देशन करता है।",
            },
            marks: 2,
            negativeMarks: 0.5,
            type: "MCQ_SINGLE",
            difficulty: "EASY",
          },
          {
            text: {
              en: "##### If $\\text{CAT} = 24$ and $\\text{BAT} = 23$, then find the numerical value of $\\text{DOG}$.",
              hi: "##### यदि $\\text{CAT} = 24$ और $\\text{BAT} = 23$ हो, तो $\\text{DOG}$ का मान ज्ञात कीजिए।",
            },
            answerIndex: 0,
            options: [
              { en: "$26$", hi: "$26$" },
              { en: "$27$", hi: "$27$" },
              { en: "$25$", hi: "$25$" },
              { en: "$28$", hi: "$28$" },
            ],
            solution: {
              en: "Sum of alphabetical positions:\n- $\\text{C}(3) + \\text{A}(1) + \\text{T}(20) = 24$\n- $\\text{D}(4) + \\text{O}(15) + \\text{G}(7) = 26$",
              hi: "वर्णमाला क्रम के अनुसार योग:\n- $\\text{C}(3) + \\text{A}(1) + \\text{T}(20) = 24$\n- $\\text{D}(4) + \\text{O}(15) + \\text{G}(7) = 26$",
            },
            marks: 2,
            negativeMarks: 0.5,
            type: "MCQ_SINGLE",
            difficulty: "EASY",
          },
        ],
      },
      {
        name: "Quantitative Aptitude & Mathematics",
        description: "Arithmetic, Algebra, and Geometry questions.",
        questions: [
          {
            text: {
              en: "##### If $x + \\dfrac{1}{x} = 5$, then find the value of $x^2 + \\dfrac{1}{x^2}$.",
              hi: "##### यदि $x + \\dfrac{1}{x} = 5$ हो, तो $x^2 + \\dfrac{1}{x^2}$ का मान ज्ञात कीजिए।",
            },
            answerIndex: 1,
            options: [
              { en: "$25$", hi: "$25$" },
              { en: "$23$", hi: "$23$" },
              { en: "$27$", hi: "$27$" },
              { en: "$21$", hi: "$21$" },
            ],
            solution: {
              en: "Squaring both sides:\n$$\\left(x + \\frac{1}{x}\\right)^2 = 5^2 \\implies x^2 + \\frac{1}{x^2} + 2 = 25 \\implies x^2 + \\frac{1}{x^2} = 23$$",
              hi: "दोनों पक्षों का वर्ग करने पर:\n$$\\left(x + \\frac{1}{x}\\right)^2 = 5^2 \\implies x^2 + \\frac{1}{x^2} + 2 = 25 \\implies x^2 + \\frac{1}{x^2} = 23$$",
            },
            marks: 2,
            negativeMarks: 0.5,
            type: "MCQ_SINGLE",
            difficulty: "MEDIUM",
          },
          {
            text: {
              en: "##### What is the value of $\\sin^2(30^\\circ) + \\cos^2(30^\\circ)$?",
              hi: "##### $\\sin^2(30^\\circ) + \\cos^2(30^\\circ)$ का मान क्या है?",
            },
            answerIndex: 0,
            options: [
              { en: "$1$", hi: "$1$" },
              { en: "$0$", hi: "$0$" },
              { en: "$\\dfrac{1}{2}$", hi: "$\\dfrac{1}{2}$" },
              { en: "$\\dfrac{3}{4}$", hi: "$\\dfrac{3}{4}$" },
            ],
            solution: {
              en: "By fundamental trigonometric identity:\n$$\\sin^2(\\theta) + \\cos^2(\\theta) = 1 \\quad \\forall \\, \\theta$$",
              hi: "त्रिकोणमितीय सर्वसमिका के अनुसार:\n$$\\sin^2(\\theta) + \\cos^2(\\theta) = 1$$",
            },
            marks: 2,
            negativeMarks: 0.5,
            type: "MCQ_SINGLE",
            difficulty: "EASY",
          },
        ],
      },
      {
        name: "General Science",
        description: "Physics, Chemistry, and Biology questions.",
        questions: [
          {
            text: {
              en: "##### Which chemical element has the symbol **Fe**?",
              hi: "##### किस रासायनिक तत्व का प्रतीक **Fe** है?",
            },
            answerIndex: 2,
            options: [
              { en: "Lead", hi: "सीसा (Lead)" },
              { en: "Fluorine", hi: "फ्लोरीन (Fluorine)" },
              { en: "Iron", hi: "लोहा (Iron)" },
              { en: "Gold", hi: "सोना (Gold)" },
            ],
            solution: {
              en: "**Fe** comes from the Latin word *Ferrum*, which is Iron.",
              hi: "**Fe** लैटिन शब्द *Ferrum* से लिया गया है, जिसका अर्थ लोहा (Iron) है।",
            },
            marks: 2,
            negativeMarks: 0.5,
            type: "MCQ_SINGLE",
            difficulty: "EASY",
          },
          {
            text: {
              en: "##### What is the acceleration due to gravity on Earth's surface approximately?",
              hi: "##### पृथ्वी की सतह पर गुरुत्वीय त्वरण ($g$) का मान लगभग कितना होता है?",
            },
            answerIndex: 1,
            options: [
              { en: "$8.9 \\text{ m/s}^2$", hi: "$8.9 \\text{ m/s}^2$" },
              { en: "$9.8 \\text{ m/s}^2$", hi: "$9.8 \\text{ m/s}^2$" },
              { en: "$10.8 \\text{ m/s}^2$", hi: "$10.8 \\text{ m/s}^2$" },
              { en: "$9.0 \\text{ m/s}^2$", hi: "$9.0 \\text{ m/s}^2$" },
            ],
            solution: {
              en: "Standard gravity on Earth's surface is approximately $9.8 \\text{ m/s}^2$.",
              hi: "पृथ्वी की सतह पर मानक गुरुत्वीय त्वरण लगभग $9.8 \\text{ m/s}^2$ होता है।",
            },
            marks: 2,
            negativeMarks: 0.5,
            type: "MCQ_SINGLE",
            difficulty: "EASY",
          },
        ],
      },
    ],
  },
  null,
  2
);

export const SAMPLE_QUESTION_JSON = SAMPLE_BILINGUAL_JSON;

export interface QuestionJsonLocation {
  startIndex: number;
  endIndex: number;
  targetIndex: number;
  line: number;
}

/**
 * Accurately finds the character offset and line number of the N-th question in a JSON string.
 * Uses structural bracket scanning (immune to LaTeX/markdown formatting differences)
 * to count question objects directly in the JSON.
 */
function extractRawQuestionsList(parsed: any): any[] {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object") return [];
  if (Array.isArray(parsed.sections)) {
    return parsed.sections.flatMap((s: any) => (Array.isArray(s?.questions) ? s.questions : []));
  }
  if (Array.isArray(parsed.questions)) {
    return parsed.questions;
  }
  if (parsed.testseries) {
    if (Array.isArray(parsed.testseries.sections)) {
      return parsed.testseries.sections.flatMap((s: any) => (Array.isArray(s?.questions) ? s.questions : []));
    }
    if (Array.isArray(parsed.testseries.questions)) {
      return parsed.testseries.questions;
    }
  }
  return [];
}

/**
 * Accurately finds the character offset and line number of the N-th question in a JSON string.
 * Uses structural bracket scanning (immune to LaTeX/markdown formatting differences)
 * to count question objects directly in the JSON, across flat questions or multi-section arrays.
 */
export function findQuestionRangeInJson(
  json: string,
  questionIndex: number
): QuestionJsonLocation | null {
  if (!json || questionIndex < 0) return null;

  // Find all "questions": [ occurrences across flat or sectional JSON
  const arrayStarts: number[] = [];
  const regex = /"questions"\s*:\s*\[/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(json)) !== null) {
    arrayStarts.push(match.index + match[0].length - 1);
  }

  // If no "questions": [ found, check if JSON root starts with [
  if (arrayStarts.length === 0) {
    let idx = 0;
    while (idx < json.length && /\s/.test(json[idx])) idx++;
    if (json[idx] === "[") {
      arrayStarts.push(idx);
    }
  }

  if (arrayStarts.length === 0) return null;

  let currentIdx = 0;

  for (const arrayStart of arrayStarts) {
    let inString = false;
    let isEscaped = false;
    let depth = 0;
    let currentStart = -1;

    for (let i = arrayStart + 1; i < json.length; i++) {
      const char = json[i];

      if (inString) {
        if (isEscaped) {
          isEscaped = false;
        } else if (char === "\\") {
          isEscaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{") {
        if (depth === 0) {
          currentStart = i;
        }
        depth++;
      } else if (char === "}") {
        depth--;
        if (depth === 0 && currentStart !== -1) {
          if (currentIdx === questionIndex) {
            const end = i + 1;
            const qSlice = json.slice(currentStart, end);
            const textMatch = /"(?:text|content|question)"\s*:\s*/.exec(qSlice);
            const textPropIndex = textMatch ? currentStart + textMatch.index : currentStart;
            const line = json.substring(0, textPropIndex).split("\n").length;
            return {
              startIndex: currentStart,
              endIndex: end,
              targetIndex: textPropIndex,
              line,
            };
          }
          currentIdx++;
          currentStart = -1;
        }
      } else if (char === "]" && depth === 0) {
        // Finished this questions array, break to next section if needed
        break;
      }
    }
  }

  return null;
}

/**
 * Computes the distribution of correct answers (A, B, C, D) across all questions in JSON.
 */
export function getAnswerDistributionInJson(json: string): {
  A: number;
  B: number;
  C: number;
  D: number;
  other: number;
  total: number;
} {
  const empty = { A: 0, B: 0, C: 0, D: 0, other: 0, total: 0 };
  if (!json || !json.trim()) return empty;

  try {
    const parsed = JSON.parse(json);
    const questionsList = extractRawQuestionsList(parsed);

    questionsList.forEach((q) => {
      if (!q || typeof q !== "object") return;
      empty.total++;

      let correctLetter: string | null = null;
      if (Array.isArray(q.options) && q.options.length > 0) {
        const correctOpt = q.options.find((o: any) => o && o.isCorrect === true);
        if (correctOpt && correctOpt.id) {
          correctLetter = String(correctOpt.id).toUpperCase();
        }
      }

      if (!correctLetter && q.correctValue) {
        correctLetter = String(q.correctValue).toUpperCase();
      }

      if (!correctLetter && typeof q.answerIndex === "number") {
        correctLetter = String.fromCharCode(65 + q.answerIndex);
      }

      if (correctLetter === "A") empty.A++;
      else if (correctLetter === "B") empty.B++;
      else if (correctLetter === "C") empty.C++;
      else if (correctLetter === "D") empty.D++;
      else empty.other++;
    });

    return empty;
  } catch {
    return empty;
  }
}

/**
 * Fisher-Yates shuffle array helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles MCQ answer options in JSON according to target distribution percentages
 * while strictly preserving question and option text content integrity.
 */
export function shuffleAnswersInJson(
  json: string,
  weights: { A?: number; B?: number; C?: number; D?: number } = { A: 25, B: 25, C: 25, D: 25 }
): {
  success: boolean;
  newJson?: string;
  stats?: { A: number; B: number; C: number; D: number; total: number };
  error?: string;
} {
  if (!json || !json.trim()) {
    return { success: false, error: "JSON input is empty" };
  }

  try {
    const parsed = JSON.parse(json);
    const questionsList = extractRawQuestionsList(parsed);

    if (questionsList.length === 0) {
      return { success: false, error: "No questions found in JSON" };
    }

    // Filter eligible MCQ questions with at least 2 options
    const mcqIndices: number[] = [];
    questionsList.forEach((q, idx) => {
      if (q && Array.isArray(q.options) && q.options.length >= 2) {
        mcqIndices.push(idx);
      }
    });

    const N = mcqIndices.length;
    if (N === 0) {
      return { success: false, error: "No multiple choice questions with options found to shuffle" };
    }

    // Calculate distribution targets
    const wA = Math.max(0, weights.A ?? 25);
    const wB = Math.max(0, weights.B ?? 25);
    const wC = Math.max(0, weights.C ?? 25);
    const wD = Math.max(0, weights.D ?? 25);
    const totalWeight = wA + wB + wC + wD || 100;

    let countA = Math.round((wA / totalWeight) * N);
    let countB = Math.round((wB / totalWeight) * N);
    let countC = Math.round((wC / totalWeight) * N);
    let countD = N - (countA + countB + countC);

    if (countD < 0) {
      countD = 0;
      const rem = N - (countA + countB);
      countC = Math.max(0, rem);
    }

    const letterPool: string[] = [];
    for (let i = 0; i < countA; i++) letterPool.push("A");
    for (let i = 0; i < countB; i++) letterPool.push("B");
    for (let i = 0; i < countC; i++) letterPool.push("C");
    for (let i = 0; i < countD; i++) letterPool.push("D");

    const shuffledPool = shuffleArray(letterPool);
    const stats = { A: 0, B: 0, C: 0, D: 0, total: N };

    mcqIndices.forEach((qIdx, poolIdx) => {
      const q = questionsList[qIdx];
      const options = q.options;

      // Identify currently correct option
      let correctOptIdx = options.findIndex((o: any) => o && o.isCorrect === true);
      if (correctOptIdx === -1 && q.correctValue) {
        correctOptIdx = options.findIndex((o: any) => o && String(o.id).toUpperCase() === String(q.correctValue).toUpperCase());
      }
      if (correctOptIdx === -1 && typeof q.answerIndex === "number") {
        correctOptIdx = q.answerIndex;
      }
      if (correctOptIdx === -1) {
        correctOptIdx = 0;
      }

      const correctOpt = options[correctOptIdx];
      const incorrectOpts = shuffleArray(options.filter((_: any, i: number) => i !== correctOptIdx));

      // Determine new target position
      let targetLetter = shuffledPool[poolIdx] || "A";
      let targetLetterIndex = targetLetter.charCodeAt(0) - 65;

      if (targetLetterIndex >= options.length) {
        targetLetterIndex = targetLetterIndex % options.length;
        targetLetter = String.fromCharCode(65 + targetLetterIndex);
      }

      const buildOptionObj = (opt: any, letter: string, isCorrect: boolean) => {
        if (typeof opt === "object" && opt !== null) {
          return {
            ...opt,
            id: letter,
            isCorrect,
          };
        }
        return {
          id: letter,
          text: opt,
          isCorrect,
        };
      };

      const newOptions = new Array(options.length);

      // Place correct option at new target index
      newOptions[targetLetterIndex] = buildOptionObj(correctOpt, targetLetter, true);

      // Distribute incorrect options across remaining indices
      let incIdx = 0;
      for (let i = 0; i < options.length; i++) {
        if (i !== targetLetterIndex) {
          const letter = String.fromCharCode(65 + i);
          newOptions[i] = buildOptionObj(incorrectOpts[incIdx], letter, false);
          incIdx++;
        }
      }

      q.options = newOptions;
      q.correctValue = targetLetter;
      if (q.answerIndex !== undefined) {
        q.answerIndex = targetLetterIndex;
      }

      if (stats[targetLetter as keyof typeof stats] !== undefined) {
        (stats as any)[targetLetter]++;
      }
    });

    const newJson = JSON.stringify(parsed, null, 2);
    return { success: true, newJson, stats };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to parse JSON" };
  }
}

/**
 * Bulk updates positive and negative marks for all questions in JSON.
 * Negative marks are calculated as a percentage of positive marks.
 */
export function applyBulkMarksInJson(
  json: string,
  positiveMarks: number,
  negativePercentage: number
): {
  success: boolean;
  newJson?: string;
  updatedCount?: number;
  negativeMarks?: number;
  error?: string;
} {
  if (!json || !json.trim()) {
    return { success: false, error: "JSON input is empty" };
  }

  try {
    const parsed = JSON.parse(json);
    const questionsList = extractRawQuestionsList(parsed);

    if (questionsList.length === 0) {
      return { success: false, error: "No questions found in JSON" };
    }

    const pos = Math.max(0, positiveMarks);
    const penaltyRatio = Math.max(0, negativePercentage) / 100;
    const neg = Math.round(pos * penaltyRatio * 100) / 100;

    let updatedCount = 0;
    questionsList.forEach((q) => {
      if (!q || typeof q !== "object") return;
      q.positiveMarks = pos;
      q.negativeMarks = neg;
      if (q.marks !== undefined) q.marks = pos;
      updatedCount++;
    });

    const newJson = JSON.stringify(parsed, null, 2);
    return {
      success: true,
      newJson,
      updatedCount,
      negativeMarks: neg,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to parse JSON" };
  }
}

/**
 * Shuffle the ORDER of questions in the JSON (Fisher-Yates).
 * If sections are present, shuffles questions within each section.
 * Does NOT touch answer options or marks — only reorders questions.
 */
export function shuffleQuestionsInJson(json: string): {
  success: boolean;
  newJson?: string;
  count?: number;
  error?: string;
} {
  if (!json || !json.trim()) {
    return { success: false, error: "JSON input is empty" };
  }

  try {
    const parsed = JSON.parse(json);

    // If sections exist, shuffle within each section
    if (parsed && typeof parsed === "object") {
      const sections = Array.isArray(parsed.sections)
        ? parsed.sections
        : parsed.testseries && Array.isArray(parsed.testseries.sections)
        ? parsed.testseries.sections
        : null;

      if (sections && sections.length > 0) {
        let totalCount = 0;
        sections.forEach((sec: any) => {
          if (Array.isArray(sec?.questions) && sec.questions.length > 1) {
            for (let i = sec.questions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [sec.questions[i], sec.questions[j]] = [sec.questions[j], sec.questions[i]];
            }
            totalCount += sec.questions.length;
          } else if (Array.isArray(sec?.questions)) {
            totalCount += sec.questions.length;
          }
        });

        if (totalCount <= 1) {
          return { success: false, error: "Need at least 2 questions across sections to shuffle" };
        }

        return {
          success: true,
          newJson: JSON.stringify(parsed, null, 2),
          count: totalCount,
        };
      }
    }

    const questionsList = extractRawQuestionsList(parsed);

    if (questionsList.length <= 1) {
      return { success: false, error: "Need at least 2 questions to shuffle" };
    }

    // Fisher-Yates shuffle (in-place)
    for (let i = questionsList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionsList[i], questionsList[j]] = [questionsList[j], questionsList[i]];
    }

    const newJson = JSON.stringify(parsed, null, 2);
    return {
      success: true,
      newJson,
      count: questionsList.length,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to parse JSON" };
  }
}
