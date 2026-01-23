"use client";

import React, { useState } from "react";
import { MarkdownRenderer, MarkdownVariant, CodeStyle } from "@/components/newMarkdownRender";

// ============================================================================
// Sample Markdown Content
// ============================================================================

const SAMPLE_CONTENT = {
  comprehensive: `# Comprehensive Markdown Test

This document showcases **all features** of the markdown renderer with *various* formatting options.

## Text Formatting

Here's a paragraph with **bold text**, *italic text*, and ***bold italic text***. You can also use \`inline code\` within sentences.

###### Hi there

Unordered list:
- First item with some text
- Second item with **bold formatting**
- Third item with \`inline code\`
- Fourth item with a [link](https://example.com)

Ordered list:
1. First numbered item
2. Second numbered item
3. Third numbered item

## Code Blocks

### JavaScript Example

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Usage
const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);
\`\`\`

### Python Example

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Example usage
numbers = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(numbers))
\`\`\`

### SQL Example

\`\`\`sql
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC;
\`\`\`

## Mathematical Expressions

Inline math: The quadratic formula is $x = \\dfrac{-b \\pm \\sqrt{b^2-4ac}}{2a}$

Display math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
E = mc^2
$$

## Tables

| Feature | Default | Question | Option | Analysis | Minimal |
|---------|---------|----------|--------|----------|---------|
| Typography | Large | Large | Small | Small | Small |
| Code Blocks | Full | Full | Compact | Compact | Basic |
| Lists | Spaced | Spaced | Compact | Compact | Compact |
| Images | Full | Full | Full | Full | Basic |

## Blockquotes

> This is a blockquote with **formatted text**.
> 
> It can span multiple lines and include *italic text* and \`code\`.
> 
> You can also nest other elements inside.

## Links and Images

Here's a [link to Google](https://google.com) and another [link to GitHub](https://github.com).

---

## Horizontal Rules

The line above is a horizontal rule, useful for separating sections.

## Complex Example

Combining multiple features:

1. **First point** with a code example: \`const x = 10;\`
2. *Second point* with a [link](https://example.com)
3. Third point with math: $f(x) = x^2 + 2x + 1$

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

const createUser = (data: Partial<User>): User => {
  return {
    id: Math.random(),
    name: data.name || "Anonymous",
    email: data.email || "",
    roles: data.roles || ["user"],
  };
};
\`\`\`
`,

  question: `# Practice Question: Binary Search Trees

## Problem Statement

Given a binary search tree (BST), write a function to find the **kth smallest element** in the tree.

### Constraints

- The number of nodes in the tree is \`n\`
- \`1 <= k <= n <= 10^4\`
- \`0 <= Node.val <= 10^4\`

### Example

\`\`\`
Input: root = [5,3,6,2,4,null,null,1], k = 3
       5
      / \\
     3   6
    / \\
   2   4
  /
 1

Output: 3
\`\`\`

### Approach

You can solve this using:
1. **In-order traversal** - Visit nodes in sorted order
2. **Iterative approach** - Use a stack
3. **Morris traversal** - O(1) space complexity

What would be your solution?
`,

  option: `**Option A**: Use a min-heap to track the smallest elements, extracting \`k\` times.

**Option B**: Perform in-order traversal and return the kth element: \`traverse(root.left) -> visit(root) -> traverse(root.right)\`

**Option C**: Use binary search on the count of left subtree nodes.
`,

  analysis: `## Analysis

**Time Complexity**: O(n) where n is the number of nodes
**Space Complexity**: O(h) where h is the height (recursion stack)

\`\`\`python
def kthSmallest(root, k):
    stack = []
    curr = root
    count = 0
    
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        
        curr = stack.pop()
        count += 1
        if count == k:
            return curr.val
        curr = curr.right
\`\`\`

**Key Insight**: In-order traversal of BST yields sorted sequence.
`,

  minimal: `Simple text with **bold** and *italic*.

Code: \`x = 10\`

- Item 1
- Item 2
- Item 3
`,
};

// ============================================================================
// Demo Component
// ============================================================================

export default function MarkdownDemoPage() {
  const [selectedVariant, setSelectedVariant] = useState<MarkdownVariant>("default");
  const [selectedCodeStyle, setCodeStyle] = useState<CodeStyle>("vscDarkPlus");
  const [selectedContent, setSelectedContent] = useState<keyof typeof SAMPLE_CONTENT>("comprehensive");

  const variants: MarkdownVariant[] = ["default", "question", "option", "analysis", "minimal"];
  const codeStyles: CodeStyle[] = ["vscDarkPlus", "oneLight", "oneDark"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Markdown Renderer Demo
          </h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive showcase of all markdown features and variants
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Controls */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Variant Selector */}
            <div className="bg-card border border-border rounded-lg p-4 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 text-foreground">
                Variant
              </h2>
              <div className="space-y-2">
                {variants.map((variant) => (
                  <button
                    key={variant}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${selectedVariant === variant
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                  >
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </button>
                ))}
              </div>

              {/* Code Style Selector */}
              <h2 className="text-lg font-semibold mb-4 mt-6 text-foreground">
                Code Style
              </h2>
              <div className="space-y-2">
                {codeStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setCodeStyle(style)}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors ${selectedCodeStyle === style
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                  >
                    {style}
                  </button>
                ))}
              </div>

              {/* Content Selector */}
              <h2 className="text-lg font-semibold mb-4 mt-6 text-foreground">
                Content
              </h2>
              <div className="space-y-2">
                {Object.keys(SAMPLE_CONTENT).map((content) => (
                  <button
                    key={content}
                    onClick={() => setSelectedContent(content as keyof typeof SAMPLE_CONTENT)}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors capitalize ${selectedContent === content
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                  >
                    {content}
                  </button>
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-xs text-blue-900 dark:text-blue-200">
                  <strong>Tip:</strong> Try switching between variants to see how the same content renders differently!
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {/* Current Settings Display */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Variant: </span>
                  <span className="font-semibold text-foreground">{selectedVariant}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Code Style: </span>
                  <span className="font-semibold text-foreground">{selectedCodeStyle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Content: </span>
                  <span className="font-semibold text-foreground capitalize">{selectedContent}</span>
                </div>
              </div>
            </div>

            {/* Rendered Markdown */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              <MarkdownRenderer
                content={SAMPLE_CONTENT[selectedContent]}
                variant={selectedVariant}
                codeStyle={selectedCodeStyle}
              />
            </div>

            {/* Feature Descriptions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">✨ Features Showcased</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Headings (H1-H6)</li>
                  <li>• Text formatting (bold, italic)</li>
                  <li>• Code blocks with syntax highlighting</li>
                  <li>• Inline code snippets</li>
                  <li>• Mathematical expressions (LaTeX)</li>
                  <li>• Tables with borders</li>
                  <li>• Lists (ordered & unordered)</li>
                  <li>• Blockquotes</li>
                  <li>• Links and horizontal rules</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">🎨 Variant Descriptions</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>Default:</strong> Full-featured, large typography</li>
                  <li><strong>Question:</strong> Optimized for problem statements</li>
                  <li><strong>Option:</strong> Compact, inline-friendly</li>
                  <li><strong>Analysis:</strong> Dense, analytical view</li>
                  <li><strong>Minimal:</strong> Bare-bones styling</li>
                </ul>
              </div>
            </div>

            {/* Raw Markdown Preview */}
            <details className="mt-6 bg-card border border-border rounded-lg p-4">
              <summary className="cursor-pointer font-semibold text-foreground hover:text-primary transition-colors">
                View Raw Markdown
              </summary>
              <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto text-xs">
                <code>{SAMPLE_CONTENT[selectedContent]}</code>
              </pre>
            </details>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Markdown Renderer Component Demo • Built with Next.js, React, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}