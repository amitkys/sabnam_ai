/*
NOTE: - Add commas after each property and array element in the JSON object.
     -  Replaced all single quotes or unquoted property names/values with double quotes.
     - I have installed (react-markdown, remark-math, rehype-katex) so you can use markdown in question(text) and options(text) in the quiz.

Some rules:
1. Use consistent delimiters - either $ or \\( and \\), but not mixed:
example: {
  "text": "बहुपद $P(x)=x^5+ax^4+bx^3+cx^2+dx+6$ को $(x-1)^2$ से विभाजित करने पर शेषफल $3x+2$ प्राप्त होता है।"
}
2. For special LaTeX commands, use double backslashes:
example: {
  "text": "यदि $\\alpha$ और $\\beta$ मूल हैं, तो $\\alpha + \\beta = -p$ और $\\alpha \\beta = q$"
}
3. For fractions and other LaTeX structures, use appropriate escaping:
example: {
  "text": "The fraction $\\frac{x+1}{x-1}$ represents..."
}
Because I have function that will:
Normalize all math delimiters to use $
Properly escape backslashes
Validate the JSON structure


const validateAndFormatMath = (jsonString: string): string => {
  // Replace LaTeX delimiters with consistent format
  let formatted = jsonString
    // Replace \( and \) with $
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    // Properly escape backslashes in math expressions
    .replace(/\\(?=[a-zA-Z^_{}])/g, "\\\\")
    // Handle special case of double backslashes
    .replace(/\\\\/g, "\\\\");

  return formatted;
};

this function runs before converting the JSON string to an object and will ensure that all math expressions are properly formatted and escaped.

export interface Data {
  testseries: {
    title: string;
    // duration in minutes
    duration: number;
  };  
  questions: {
    text: string;
    // right answer from given options
    answer: string;
    options: {
      text: string;
    }[];
  }[];
}
// sample data
{
  "testseries": {
    "title": "Mixed Subject Quiz",
    "duration": 600
  },
  "questions": [
    {
      "text": "Calculate the area of a circle with radius 5 units using the formula $A = \\pi r^2$.",
      "answer": "78.54 square units",
      "options": [
        { "text": "31.42 square units" },
        { "text": "78.54 square units" },
        { "text": "125.66 square units" },
        { "text": "157.08 square units" }
      ]
    },
    {
      "text": "If $\\alpha$ and $\\beta$ are roots of the equation $x^2 + px + q = 0$, then find $\\alpha + \\beta$ in terms of $p$ and $q$.",
      "answer": "$-p$",
      "options": [
        { "text": "$p$" },
        { "text": "$-p$" },
        { "text": "$q$" },
        { "text": "$-q$" }
      ]
    },
    {
      "text": "Solve the equation: $\\frac{x+1}{2} + \\frac{x-1}{3} = 4$",
      "answer": "$x = 5$",
      "options": [
        { "text": "$x = 3$" },
        { "text": "$x = 4$" },
        { "text": "$x = 5$" },
        { "text": "$x = 6$" }
      ]
    },
    {
      "text": "What is the derivative of $f(x) = x^3 + 2x^2 - 4x + 1$?",
      "answer": "$f'(x) = 3x^2 + 4x - 4$",
      "options": [
        { "text": "$f'(x) = 3x^2 + 4x - 4$" },
        { "text": "$f'(x) = x^2 + 4x - 4$" },
        { "text": "$f'(x) = 3x^2 + 2x - 4$" },
        { "text": "$f'(x) = 3x^2 + 4x + 4$" }
      ]
    },
    {
      "text": "Find the area of the triangle whose sides are $a = 5$ cm, $b = 6$ cm, and $c = 7$ cm using Heron's formula: $A = \\sqrt{s(s-a)(s-b)(s-c)}$ where $s = \\frac{a+b+c}{2}$.",
      "answer": "14.7 square cm",
      "options": [
        { "text": "12.5 square cm" },
        { "text": "13.6 square cm" },
        { "text": "14.7 square cm" },
        { "text": "15.8 square cm" }
      ]
    },
    {
      "text": "In chemistry, the pH of a solution is given by $pH = -\\log[H^+]$. If $[H^+] = 1.0 \\times 10^{-7}$ M, what is the pH?",
      "answer": "7.0",
      "options": [
        { "text": "6.0" },
        { "text": "7.0" },
        { "text": "8.0" },
        { "text": "$-7.0$" }
      ]
    },
    {
      "text": "बहुपद $P(x)=x^5+2x^4+3x^3+4x^2+5x+6$ को $x-1$ से विभाजित करने पर शेषफल क्या होगा?",
      "answer": "$P(1) = 21$",
      "options": [
        { "text": "$P(1) = 19$" },
        { "text": "$P(1) = 20$" },
        { "text": "$P(1) = 21$" },
        { "text": "$P(1) = 22$" }
      ]
    }
  ]
}
*/





/*

give me 50 objective question <query> in 5 set each set will have 10 questions, questions should be most frequent asked in exam
you will increase difficulty level in each set. give all question in json format all json rules are mentioned below and I given a sample json data for your reference 

*/

/* Good, keep in mind question quality is important, asked all types of question in objective, keep increase difficulty, also keep in mind json format rules. */

export interface Data {
  testseries: {
    title: string;
    duration: number;
  };
  questions: {
    text: string;
    answer: string;
    options: {
      text: string;
    }[];
  }[];
}

export interface FetchedTestSeriesData {
  testseries: {
    id: string;
    title: string;
    duration: number;
  };
  questions: {
    id: string;
    text: string;
    answer: string;
    options: {
      id: string;
      text: string;
    }[];
  }[];
}

// Types for test attempt submission
export interface TestAttemptSubmission {
  testSeriesId: string;
  userId: string;
  startedAt: string; // ISO string timestamp
  completedAt: string; // ISO string timestamp
  answers: TestAnswer[];
}

export interface TestAnswer {
  questionId: string; // References Question model
  optionId: string; // References Option model
  isCorrect: boolean; // Calculated by comparing answer
}

// Interface for tracking answers during test
export interface Answer {
  questionId: string; // References Question model
  optionId: string; // References Option model
  answer: string; // Correct answer from Question
  selectedAnswer: string; // User selected option text
}


export interface CustomProps {
    heading: string;
    data: string | number;
}

export interface TestSeriesResponse {
  success: boolean;
  data: Array<{
    id: string;
    title: string;
    duration: number;
  }>;
}

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export interface TestSummaryResponse {
  testSummary: {
    testSeriesId: string;
    attempId: string;
    testName: string;
    attemptDate: Date;
    obtainedMarks: number;
    totalMarks: number;
  }[];
}

// types/user.ts
export interface UserType {
  id: string;
  name?: string | null; // Allow null
  email?: string | null; // Allow null
  image?: string | null; // Allow null
}