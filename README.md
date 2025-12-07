# AI Question (In JSON object) Generation Guidelines  
## 1. JSON Structure & Schema
Output must be a single JSON object containing `testseries` metadata and a `questions` array.

{
  "testseries": {
    "title": "BSEB 10th Mathematics",
    "exactName": "board/10th",
    "duration": 90,
    "level": "m",
    "availableLanguage": ["English", "Hindi"],
    "preferredLanguage": "Hindi",
    "isPublic": false,
    "questions": [
      // ... Question Objects (see below)
    ]
  }
}

### Question Object Format
-note: `tags` uses for 'question previously asked year name like, 2025, 2026 etc. if not provided year then set to empty array.
 -- from 2nd response onwards, only give question object (not metadata)
**Strict Rule:** `tags` must always be an empty array `[]`.

{
  "text": {
    "en": "##### What is the value of $E=mc^2$?",
    "hi": "##### $E=mc^2$ का मान क्या है?"
  },
  "answerIndex": 2, // 0-based index matching the correct option
  "options": [
    { "en": "Option A", "hi": "विकल्प A" },
    { "en": "Option B", "hi": "विकल्प B" },
    { "en": "Correct Answer", "hi": "सही उत्तर" },
    { "en": "Option D", "hi": "विकल्प D" }
  ],
  "marks": 1,
  "tags": [] 
}

## 2. Formatting & Syntax Rules

### Text & Elements
* **Prefix:** Every question text must start with `#####`.
* **Line Breaks:** Use `\n` to separate distinct sections (images, tables, code, quotes).
* **Markdown Syntax:**
    * **Images:** `\n ![Alt text](url) \n`
    * **Tables:** `\n | Col 1 | Col 2 | \n | --- | --- | \n | Val 1 | Val 2 | \n`
    * **Blockquotes:** `\n > Quote text \n`
    * **Code Blocks:** `\n ````python \n code_here \n ```` \n`

### Math & LaTeX (Crucial)
* **Delimiters:** Use `$` for all math expressions (inline and display). Example: `$x^2$`.
* **Escaping:** You must double-escape backslashes for JSON validity.
    * ❌ **Wrong:** `$880\ \text{cm}^2$` or `\frac`
    * ✅ **Right:** `$880 \\, \\text{cm}^2$` or `\\dfrac`
* **Fractions:** Use `\\dfrac` for better visibility.

## 3. Extraction Checklist
1.  **Extract:** Content in both English (`en`) and Hindi (`hi`).
2.  **Validate:** Ensure specific option text matches `answerIndex`.
3.  **Sanitize:** Ensure strict JSON validity (no trailing commas, properly escaped quotes/backslashes).
4.  **Tags:** Set `"tags": []`.
