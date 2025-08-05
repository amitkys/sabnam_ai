import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export default function Page() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

/*
// demo use of markdown

import { MarkdownRenderer } from "@/components/newMarkdownRender";

const markdownContent = `
# Question Title

###### Subtitle

Here is a table:

| Amit kumar | Badal raj | Deepak kumar | Deepak kumar |
|---|---|---|---|
| 1 | 2 | 3 | 4 |

\`\`\`rust
fn main() {
// error: semicolon is missing
  println!("hello woddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddrld");
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

*/
