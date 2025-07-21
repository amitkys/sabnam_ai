// Demo usage
"use client";
import { MarkdownRenderer } from "@/components/newMarkdownRender";

const markdownContent = `
# Question Title

###### Subtitle

Here is a table:

| A | B |
|---|---|
| 1 | 2 |

\`\`\`rust
fn main() {
// error: semicolon is missing
  println!("hello world");
  for i in 1..4 {
    println!("{}", i);
  }
}
\`\`\`

Here is an image:

![Alt text](https://picsum.photos/600/300)

And an equation: $E=mc^2$

Block equation:

$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$
`;

export default function Page() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <MarkdownRenderer content={markdownContent} />
      </div>
    </div>
  );
};
