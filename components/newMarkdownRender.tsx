"use client";

import React, { useMemo, useCallback } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image from "next/image";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

import "katex/dist/katex.min.css";

// ============================================================================
// Types & Constants
// ============================================================================

interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
}

interface CodeComponentProps extends BaseComponentProps {
  inline?: boolean;
  node?: any;
}

interface ImageComponentProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | Blob;
  alt?: string;
}

export type MarkdownVariant =
  | "default" // Full markdown with all features
  | "question" // For question text - medium prose
  | "option" // For option text - compact inline
  | "analysis" // For analysis view - compact with smaller code blocks
  | "minimal"; // Minimal styling for simple text

export type CodeStyle = "vscDarkPlus" | "oneLight" | "oneDark";

interface MarkdownRendererProps {
  content: string;
  variant?: MarkdownVariant;
  className?: string;
  codeStyle?: CodeStyle;
  customComponents?: Partial<React.ComponentProps<typeof Markdown>["components"]>;
}

// Code block styling constants
const CODE_BLOCK_STYLES = {
  fontSize: {
    default: "0.875rem",
    option: "0.75rem",
    analysis: "0.75rem",
  },
  lineHeight: "1.5",
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if children contain block-level elements
 */
const hasBlockLevelChild = (children: React.ReactNode): boolean => {
  let hasBlock = false;

  React.Children.forEach(children, (child: any) => {
    if (!child) return;

    // Check for React elements
    if (React.isValidElement(child)) {
      const type = child.type;

      // Check if it's a component or HTML element
      if (typeof type === 'string') {
        const blockElements = ['div', 'p', 'pre', 'table', 'blockquote', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        if (blockElements.includes(type)) {
          hasBlock = true;
        }
      } else if (typeof type === 'function' || typeof type === 'object') {
        // For components, check the displayName or name
        const componentType = type as any;
        const componentName = componentType.displayName || componentType.name || '';
        if (componentName.includes('CodeBlock') ||
          componentName.includes('Image') ||
          componentName.includes('Table')) {
          hasBlock = true;
        }
      }

      // Check node prop if available
      if ((child.props as any)?.node?.tagName) {
        const blockTags = ['div', 'pre', 'code', 'table', 'img'];
        if (blockTags.includes((child.props as any).node.tagName)) {
          hasBlock = true;
        }
      }
    }
  });

  return hasBlock;
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Safe Image component with proper blob URL cleanup and error handling
 */
const SafeMarkdownImage = React.memo(({ src, alt = "", ...rest }: ImageComponentProps) => {
  const [imageUrl, setImageUrl] = React.useState<string>("");
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!src) {
      setImageUrl("");
      return;
    }

    if (typeof src === "string") {
      setImageUrl(src);
      return;
    }

    // Handle Blob URLs with proper cleanup
    if (typeof window !== "undefined" && src instanceof Blob) {
      const blobUrl = URL.createObjectURL(src);
      setImageUrl(blobUrl);

      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }

    setImageUrl(String(src));
  }, [src]);

  if (!imageUrl || error) {
    return (
      <div className="my-8 p-8 bg-muted/50 rounded-lg border border-border text-center">
        <p className="text-sm text-muted-foreground">
          {error ? "Failed to load image" : "No image source provided"}
        </p>
        {alt && <p className="text-xs text-muted-foreground mt-1">{alt}</p>}
      </div>
    );
  }

  const isExternal = imageUrl.startsWith("http");
  const validSrc = isExternal ? imageUrl : `/${imageUrl.replace(/^\/+/, "")}`;

  // Filter out Next.js Image incompatible props
  const safeProps = Object.fromEntries(
    Object.entries(rest).filter(
      ([key]) => !["width", "height", "style", "loading"].includes(key)
    )
  );

  return (
    <div className="my-8">
      <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-border bg-muted/30">
        <Image
          fill
          alt={alt}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          src={validSrc}
          unoptimized={isExternal}
          onError={() => setError(true)}
          {...safeProps}
        />
      </div>
      {alt && (
        <p className="text-sm text-muted-foreground text-center mt-2 italic">
          {alt}
        </p>
      )}
    </div>
  );
});

SafeMarkdownImage.displayName = "SafeMarkdownImage";

/**
 * Code Block component with proper error handling
 */
interface CodeBlockProps {
  children: React.ReactNode;
  language: string;
  inline?: boolean;
  variant: MarkdownVariant;
  isDarkMode: boolean;
  codeStyle: any;
}

const CodeBlock = React.memo(({
  children,
  language,
  inline,
  variant,
  isDarkMode,
  codeStyle,
}: CodeBlockProps) => {
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleCopy = useCallback(() => {
    const code = String(children).replace(/\n$/, "");
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [children]);

  if (inline) {
    const inlineClass = variant === "option"
      ? "px-1 py-0.5 text-xs"
      : "px-2 py-1 text-sm";

    return (
      <code
        className={cn(
          inlineClass,
          isDarkMode ? "bg-muted" : "bg-muted/50",
          "rounded font-mono text-foreground border border-border/50 break-words"
        )}
      >
        {children}
      </code>
    );
  }

  // For option and analysis variants, use compact code blocks
  if (variant === "option" || variant === "analysis") {
    return (
      <div className={variant === "option" ? "mt-2" : "my-2 overflow-x-auto"}>
        <SyntaxHighlighter
          PreTag="div"
          codeTagProps={{ className: "font-mono" }}
          customStyle={{
            margin: 0,
            borderRadius: "0.375rem",
            background: isDarkMode ? "#1e1e1e" : "#f5f5f5",
            fontSize: CODE_BLOCK_STYLES.fontSize[variant],
            lineHeight: CODE_BLOCK_STYLES.lineHeight,
            whiteSpace: variant === "option" ? "pre-wrap" : "pre",
            wordBreak: variant === "option" ? "break-word" : "normal",
          }}
          language={language || "text"}
          style={codeStyle}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  }

  // Full-featured code block with header
  return (
    <div className="my-6">
      <div className="relative">
        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-t border-l border-r border-border rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5" role="presentation">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              {language || "text"}
            </span>
            <button
              onClick={handleCopy}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy code"
            >
              {copySuccess ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className="custom-scrollbar border-b border-l border-r border-border rounded-b-lg overflow-hidden">
          <SyntaxHighlighter
            PreTag="div"
            codeTagProps={{ className: "font-mono" }}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: isDarkMode ? "#1e1e1e" : "#f5f5f5",
              fontSize: CODE_BLOCK_STYLES.fontSize.default,
              lineHeight: CODE_BLOCK_STYLES.lineHeight,
            }}
            language={language || "text"}
            style={codeStyle}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";

// ============================================================================
// Main Component
// ============================================================================

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  variant = "default",
  className = "",
  codeStyle,
  customComponents = {},
}) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Handle mounting to prevent hydration issues
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle system theme properly
  const isDarkMode = useMemo(() => {
    if (!mounted) return false; // Return false during SSR
    const effectiveTheme = theme === "system" ? resolvedTheme : theme;
    return effectiveTheme === "dark";
  }, [theme, resolvedTheme, mounted]);

  // Determine code style based on variant and theme
  const selectedCodeStyle = useMemo(() => {
    if (codeStyle) {
      const styles = { vscDarkPlus, oneLight, oneDark };
      return styles[codeStyle] || (isDarkMode ? vscDarkPlus : oneLight);
    }

    switch (variant) {
      case "analysis":
        return oneDark;
      default:
        return isDarkMode ? vscDarkPlus : oneLight;
    }
  }, [codeStyle, variant, isDarkMode]);

  // Memoized component factories
  const createHeading = useCallback((level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const Component = ({ children }: BaseComponentProps) => {
      const Tag = `h${level}` as const;

      const sizeClasses = {
        minimal: ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-xs"],
        default: ["text-4xl", "text-3xl", "text-2xl", "text-xl", "text-lg", "text-base"],
      }[variant === "minimal" ? "minimal" : "default"];

      const baseClass = level <= 2
        ? "font-bold mb-6 text-foreground border-b border-border pb-3"
        : "font-semibold mb-1.5 mt-3 text-foreground";

      return (
        <Tag className={cn(baseClass, sizeClasses[level - 1])}>
          {children}
        </Tag>
      );
    };

    Component.displayName = `Heading${level}`;
    return Component;
  }, [variant]);

  // Build components object with memoization
  const components = useMemo(() => {
    const baseComponents = {
      h1: createHeading(1),
      h2: createHeading(2),
      h3: createHeading(3),
      h4: createHeading(4),
      h5: createHeading(5),
      h6: createHeading(6),

      p: ({ children, node }: BaseComponentProps & { node?: any }) => {
        // FIX: Check if children contain block-level elements
        const hasBlock = hasBlockLevelChild(children);

        // If it has block elements, use a div instead of p
        if (hasBlock) {
          const textClass = variant === "minimal"
            ? "mb-2 text-sm text-foreground/90"
            : variant === "analysis"
              ? "mb-2 leading-relaxed text-foreground/75"
              : "mb-4 leading-relaxed text-foreground/90";

          return <div className={textClass}>{children}</div>;
        }

        // Handle option variant specially - use span for true inline
        if (variant === "option") {
          return <span className="text-foreground inline">{children}</span>;
        }

        // Safe to use <p> tag
        const textClass = variant === "minimal"
          ? "mb-2 text-sm text-foreground/90"
          : variant === "analysis"
            ? "mb-2 leading-relaxed text-foreground/75"
            : "mb-4 leading-relaxed text-foreground/90";

        return <p className={textClass}>{children}</p>;
      },

      img: (props: ImageComponentProps) => <SafeMarkdownImage {...props} />,

      code: ({ children, className, inline }: CodeComponentProps) => {
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : "";

        if (variant === "minimal" && !inline) {
          return (
            <pre className="p-2 bg-muted rounded text-xs overflow-x-auto my-2">
              <code className="font-mono">{children}</code>
            </pre>
          );
        }

        return (
          <CodeBlock
            language={language}
            inline={inline}
            variant={variant}
            isDarkMode={isDarkMode}
            codeStyle={selectedCodeStyle}
          >
            {children}
          </CodeBlock>
        );
      },

      // Table components
      table: ({ children }: BaseComponentProps) => (
        <div className="my-6">
          <div className="overflow-hidden rounded-lg border border-border shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse">{children}</table>
            </div>
          </div>
        </div>
      ),

      thead: ({ children }: BaseComponentProps) => (
        <thead className="bg-muted/50 border-b border-border">
          {children}
        </thead>
      ),

      th: ({ children }: BaseComponentProps) => (
        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border last:border-r-0">
          <div className="flex items-center">{children}</div>
        </th>
      ),

      tbody: ({ children }: BaseComponentProps) => (
        <tbody className="bg-card divide-y divide-border">{children}</tbody>
      ),

      td: ({ children }: BaseComponentProps) => (
        <td className="px-4 py-3 text-sm text-foreground/90 border-b border-border border-r last:border-r-0">
          {children}
        </td>
      ),

      tr: ({ children }: BaseComponentProps) => (
        <tr className="hover:bg-muted/30 transition-colors duration-150">
          {children}
        </tr>
      ),

      // List components
      ul: ({ children }: BaseComponentProps) => (
        <ul className={cn("my-4 space-y-2", variant === "minimal" && "my-2 space-y-1")}>
          {children}
        </ul>
      ),

      ol: ({ children }: BaseComponentProps) => (
        <ol className={cn("my-4 space-y-2 list-decimal list-inside", variant === "minimal" && "my-2 space-y-1")}>
          {children}
        </ol>
      ),

      li: ({ children }: BaseComponentProps) => {
        const dotSize = variant === "minimal" ? "w-1 h-1" : "w-1.5 h-1.5";

        return (
          <li className="flex items-start gap-2 text-foreground/90">
            <span className={cn("bg-primary rounded-full mt-2 shrink-0", dotSize)} />
            <span className="flex-1">{children}</span>
          </li>
        );
      },

      blockquote: ({ children }: BaseComponentProps) => (
        <blockquote className="my-6 pl-6 border-l-4 border-primary/30 bg-muted/30 py-2 rounded-r-lg">
          <div className="text-foreground/80 italic">{children}</div>
        </blockquote>
      ),

      hr: () => <hr className="my-8 border-border" />,

      a: ({ children, href }: BaseComponentProps & { href?: string }) => (
        <a
          href={href}
          className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          target={href?.startsWith("http") ? "_blank" : undefined}
          rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      ),

      strong: ({ children }: BaseComponentProps) => (
        <strong className="font-semibold text-foreground">{children}</strong>
      ),

      em: ({ children }: BaseComponentProps) => (
        <em className="italic text-foreground/90">{children}</em>
      ),
    };

    // Merge with custom components
    return { ...baseComponents, ...customComponents };
  }, [variant, isDarkMode, selectedCodeStyle, customComponents, createHeading]);

  // Wrapper classes based on variant
  const wrapperClasses = useMemo(() => {
    const base = "prose prose-neutral dark:prose-invert max-w-none";
    const variantClass = {
      default: "prose-lg",
      question: "prose-lg",
      option: "prose-sm",
      analysis: "prose-sm",
      minimal: "prose-sm",
    }[variant];

    return cn(base, variantClass, className);
  }, [variant, className]);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className={wrapperClasses}>
        <Markdown
          components={components}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkMath, remarkGfm]}
        >
          {content}
        </Markdown>
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <Markdown
        components={components}
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkMath, remarkGfm]}
      >
        {content}
      </Markdown>
    </div>
  );
};

MarkdownRenderer.displayName = "MarkdownRenderer";