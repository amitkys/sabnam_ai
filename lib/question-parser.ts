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
  let rawQuestionsList: any[] = [];

  // Shape 1: { testseries: { ... }, questions: [...] }
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

      if (Array.isArray(ts.questions)) {
        rawQuestionsList = ts.questions;
      }
    }

    if (Array.isArray(parsedObject.questions)) {
      rawQuestionsList = parsedObject.questions;
    } else if (rawQuestionsList.length === 0 && (parsedObject.text || parsedObject.content)) {
      // Single question object
      rawQuestionsList = [parsedObject];
    }
  } else if (Array.isArray(parsedObject)) {
    // Shape 2: Array of questions [ {...}, {...} ]
    rawQuestionsList = parsedObject;
  }

  if (rawQuestionsList.length === 0) {
    return {
      success: false,
      error: "No question objects found in the JSON. Make sure your JSON contains an array of questions.",
      questions: [],
    };
  }

  // Normalize each question
  const questions: NormalizedQuestion[] = rawQuestionsList
    .filter((q) => q && typeof q === "object")
    .map((q, idx) => normalizeSingleQuestion(q, idx));

  return {
    success: true,
    metadata,
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

export const SAMPLE_QUESTION_JSON = SAMPLE_BILINGUAL_JSON;

