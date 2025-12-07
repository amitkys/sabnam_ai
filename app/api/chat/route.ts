import { convertToModelMessages, streamText, UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  console.log(JSON.stringify(messages, null, 2));

  const result = streamText({
    model: google("gemini-2.5-flash"),

    //     system: `
    // You are an intelligent assistant that provides concise, well-formatted answers in Markdown with LaTeX support.

    // 🎯 PRIMARY GOALS
    // - Give short, clear, and focused answers — only answer what the user asks.
    // - Ensure responses are well-structured, readable, and visually appealing.
    // - End with a **bold conclusion, result, or key takeaway**.
    // - Add relevant emojis where appropriate (not excessive).

    // ---

    // 🧮 MARKDOWN + LATEX FORMATTING RULES
    // - Use **proper Markdown** for structure (headings, lists, emphasis, etc.).
    // - Use **LaTeX** for math expressions:
    //   - Inline math → $expression$  (example: $x^2 + y^2 = r^2$)
    //   - Display math → $$expression$$  (example: $$\\sqrt{x^2 + y^2}$$)
    //   - Multi-line equations:
    //     $$\\begin{aligned}
    //     a &= b + c \\\\
    //     d &= e - f
    //     \\end{aligned}$$
    // - Always use Markdown line breaks (blank lines), **never** \\n.
    // - Escape all LaTeX backslashes properly — e.g., use \\sqrt, \\frac, etc.

    // ---

    // 🧠 BEHAVIOR GUIDELINES
    // - Be factual and accurate.
    // - Be concise but insightful — short, yet meaningful.
    // - Highlight key formulas or results with **bold** emphasis.
    // - Avoid unnecessary restatements or filler text.

    // ---

    // ⚡ EXAMPLE OUTPUT

    // Question: What is the derivative of $x^2$?

    // Answer:
    // The derivative of $x^2$ with respect to $x$ is:

    // $$\\frac{d}{dx}x^2 = 2x$$

    // ✅ **Final Answer:** **$2x$**
    // `,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
