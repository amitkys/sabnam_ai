

# AI Question (In JSON object) Generation Guidelines## 1. Response Flow & Output Structure### **1st Response (Metadata + Questions)**

The first response must be a single valid JSON object containing `testseries` metadata and a `questions` array.```json

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

      // ... Question Objects

    ]

  }

}

2nd Response Onwards (Questions Only)

From the second response onwards, output ONLY the individual Question Objects.

Do NOT include the testseries metadata.

Do NOT wrap the objects in a parent array [].

Do NOT merge questions; strictly keep them as separate objects.

Example Output (2nd Response+):

JSON


{

  "text": { ... },

  "answerIndex": 0,

  ...

},

{

  "text": { ... },

  "answerIndex": 1,

  ...

}

2. Question Object Schema

Strict Rules:

Tags: tags must always be an empty array [].

Language Keys: Use en for English and hi for Hindi. If a language is missing in the source, EXCLUDE that key entirely (do not use empty strings).

JSON Format:

JSON


{

  "text": {

    "en": "##### What is the value of $E=mc^2$?",  // Omit if English is missing

    "hi": "##### $E=mc^2$ का मान क्या है?"

  },

  "answerIndex": 2, // 0-based index matching the correct option

  "options": [

    { "en": "Option A", "hi": "विकल्प A" },       // Omit 'en' if missing

    { "en": "Option B", "hi": "विकल्प B" },

    { "en": "Correct Answer", "hi": "सही उत्तर" },

    { "en": "Option D", "hi": "विकल्प D" }

  ],

  "marks": 1,

  "tags": []

}

3. Formatting & Syntax Rules

Text & Elements

Prefix: Every question text must start with #####.

Line Breaks: Use \n to separate distinct sections (images, tables, code, quotes).

Markdown Syntax:

Images: \n ![Alt text](url) \n

Tables: \n | Col 1 | Col 2 | \n | --- | --- | \n | Val 1 | Val 2 | \n

Blockquotes: \n > Quote text \n

Code Blocks: \n ````python \n code_here \n ```` \n

Math & LaTeX (Crucial)

Delimiters: Use $ for all math expressions (inline and display). Example: $x^2$.

Escaping: You must double-escape backslashes for JSON validity.

❌ Wrong: $880\ \text{cm}^2$ or \frac

✅ Right: $880 \\, \\text{cm}^2$ or \\dfrac

Fractions: Use \\dfrac for better visibility.

4. Extraction Checklist

Extract: Content in available languages (en and/or hi). Exclude keys for missing languages.

Separation: Identify strictly distinct questions. Do not merge adjacent questions into one object.

Validate: Ensure specific option text matches answerIndex.

Sanitize: Ensure strict JSON validity (properly escaped quotes/backslashes).

Tags: Always set "tags": [].


..........................................................................................

JSON guildline from exported question from image





** do not wrap with array
** do not have any prefix in question and options

Json format guide: 
question 1

{

  "text": {

    "en": "##### What is the value of $E=mc^2$?",  // Omit if English is missing

    "hi": "##### $E=mc^2$ का मान क्या है?"

  },

  "answerIndex": 2, // 0-based index matching the correct option

  "options": [

    { "en": "Option A", "hi": "विकल्प A" },       // Omit 'en' if missing

    { "en": "Option B", "hi": "विकल्प B" },

    { "en": "Correct Answer", "hi": "सही उत्तर" },

    { "en": "Option D", "hi": "विकल्प D" }

  ],

  "marks": 1,

  "tags": []

}

question 2

{

  "text": {

    "en": "##### What is the value of $E=mc^2$?",  // Omit if English is missing

    "hi": "##### $E=mc^2$ का मान क्या है?"

  },

  "answerIndex": 2, // 0-based index matching the correct option

  "options": [

    { "en": "Option A", "hi": "विकल्प A" },       // Omit 'en' if missing

    { "en": "Option B", "hi": "विकल्प B" },

    { "en": "Correct Answer", "hi": "सही उत्तर" },

    { "en": "Option D", "hi": "विकल्प D" }

  ],

  "marks": 1,

  "tags": []

}

so on..

Formatting & Syntax Rules

Text & Elements

Prefix: Every question text must start with #####.

Line Breaks: Use \n to separate distinct sections (images, tables, code, quotes).

Markdown Syntax:

Images: \n ![Alt text](url) \n

Tables: \n | Col 1 | Col 2 | \n | --- | --- | \n | Val 1 | Val 2 | \n

Blockquotes: \n > Quote text \n

Code Blocks: \n ````python \n code_here \n ```` \n

Math & LaTeX (Crucial)

Delimiters: Use $ for all math expressions (inline and display). Example: $x^2$.

Escaping: You must double-escape backslashes for JSON validity.

❌ Wrong: $880\ \text{cm}^2$ or \frac

✅ Right: $880 \\, \\text{cm}^2$ or \\dfrac

Fractions: Use \\dfrac for better visibility.

4. Extraction Checklist

Extract: Content in available languages (en and/or hi). Exclude keys for missing languages.

Separation: Identify strictly distinct questions. Do not merge adjacent questions into one object.

Validate: Ensure specific option text matches answerIndex.

Sanitize: Ensure strict JSON validity (properly escaped quotes/backslashes).

Tags: Always set "tags": [].

