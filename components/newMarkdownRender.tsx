"use client";

import React from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

import "katex/dist/katex.min.css";

interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
  node?: any;
}

export type MarkdownVariant =
  | 'default'      // Full markdown with all features
  | 'question'     // For question text - medium prose
  | 'option'       // For option text - compact inline
  | 'analysis'     // For analysis view - compact with smaller code blocks
  | 'minimal';     // Minimal styling for simple text

export type CodeStyle = 'vscDarkPlus' | 'oneLight' | 'oneDark';

interface MarkdownRendererProps {
  content: string;
  variant?: MarkdownVariant;
  className?: string;
  codeStyle?: CodeStyle;
  // Override specific component styles if needed
  customComponents?: Partial<React.ComponentProps<typeof Markdown>['components']>;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  variant = 'default',
  className = '',
  codeStyle,
  customComponents = {}
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Determine code style based on variant and theme
  const getCodeStyle = () => {
    if (codeStyle) {
      switch (codeStyle) {
        case 'vscDarkPlus': return vscDarkPlus;
        case 'oneLight': return oneLight;
        case 'oneDark': return oneDark;
        default: return isDarkMode ? vscDarkPlus : oneLight;
      }
    }

    // Default based on variant
    switch (variant) {
      case 'analysis':
        return oneDark;
      default:
        return isDarkMode ? vscDarkPlus : oneLight;
    }
  };

  const selectedCodeStyle = getCodeStyle();

  // Base components that work for all variants
  const baseComponents = {
    h1: ({ children }: ComponentProps) => (
      <h1 className={cn(
        "font-bold mb-6 text-foreground border-b border-border pb-3",
        variant === 'minimal' ? "text-2xl" : "text-4xl"
      )}>
        {children}
      </h1>
    ),
    h2: ({ children }: ComponentProps) => (
      <h2 className={cn(
        "font-semibold mb-5 mt-8 text-foreground border-b border-border/50 pb-2",
        variant === 'minimal' ? "text-xl" : "text-3xl"
      )}>
        {children}
      </h2>
    ),
    h3: ({ children }: ComponentProps) => (
      <h3 className={cn(
        "font-semibold mb-4 mt-6 text-foreground",
        variant === 'minimal' ? "text-lg" : "text-2xl"
      )}>
        {children}
      </h3>
    ),
    h4: ({ children }: ComponentProps) => (
      <h4 className={cn(
        "font-semibold mb-4 mt-6 text-foreground",
        variant === 'minimal' ? "text-base" : "text-xl"
      )}>
        {children}
      </h4>
    ),
    h5: ({ children }: ComponentProps) => (
      <h5 className={cn(
        "font-semibold mb-4 mt-6 text-foreground",
        variant === 'minimal' ? "text-sm" : "text-lg"
      )}>
        {children}
      </h5>
    ),
    h6: ({ children }: ComponentProps) => (
      <h6 className={cn(
        "font-semibold mb-4 mt-6 text-foreground",
        variant === 'minimal' ? "text-xs" : "text-base"
      )}>
        {children}
      </h6>
    ),
  };

  // Variant-specific component configurations
  const variantComponents = {
    default: {
      ...baseComponents,
      p: ({ children, node, ...props }: ComponentProps) => {
        // Check if the paragraph only contains an image
        const hasImage = React.Children.toArray(children).some(
          (child: any) => child?.type?.name === 'img' || child?.props?.node?.tagName === 'img'
        );

        if (hasImage) {
          return <div className="mb-4">{children}</div>;
        }

        return (
          <p className="mb-4 leading-relaxed text-foreground/90" {...props}>
            {children}
          </p>
        );
      },
      img: (props: React.ImgHTMLAttributes<HTMLImageElement> & { src?: string | Blob }) => {
        const { alt = '', src, ...rest } = props;

        const imageUrl = (() => {
          if (!src) return '';
          if (typeof src === 'string') return src;
          if (typeof window !== 'undefined' && src instanceof Blob) {
            return URL.createObjectURL(src);
          }
          return String(src);
        })();

        const isExternal = imageUrl.startsWith('http');
        const validSrc = isExternal ? imageUrl : `/${imageUrl.replace(/^\/+/, '')}`;

        return (
          <div className="my-8">
            <div className="relative w-full aspect-video">
              <Image
                src={validSrc}
                alt={alt}
                fill
                className="object-cover rounded-lg border border-border"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                unoptimized={isExternal}
                {...Object.fromEntries(
                  Object.entries(rest).filter(
                    ([key]) => !['width', 'height', 'style'].includes(key)
                  )
                )}
              />
            </div>
            {alt && (
              <p className="text-sm text-muted-foreground text-center mt-2 italic">
                {alt}
              </p>
            )}
          </div>
        );
      },
      code: ({ children, className, inline, ...props }: ComponentProps) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';

        if (inline) {
          return (
            <code
              className={`px-2 py-1 ${isDarkMode ? 'bg-muted' : 'bg-muted/50'} rounded-md text-sm font-mono text-foreground border border-border/50`}
              {...props}
            >
              {children}
            </code>
          );
        }

        return (
          <div className="my-6">
            <div className="relative">
              <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-t border-l border-r border-border rounded-t-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {language || 'text'}
                </span>
              </div>
              <div className="custom-scrollbar border-b border-l border-r border-border rounded-b-lg overflow-hidden">
                <SyntaxHighlighter
                  style={selectedCodeStyle}
                  language={language || 'text'}
                  PreTag="div"
                  codeTagProps={{
                    className: 'font-mono',
                  }}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        );
      },
    },

    question: {
      ...baseComponents,
      p: ({ children }: ComponentProps) => (
        <p className="mb-4 leading-relaxed text-foreground/90">
          {children}
        </p>
      ),
      code: ({ children, className, inline, ...props }: ComponentProps) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';

        if (inline) {
          return (
            <code
              className={`px-2 py-1 ${isDarkMode ? 'bg-muted' : 'bg-muted/50'} rounded-md text-sm font-mono text-foreground border border-border/50`}
              {...props}
            >
              {children}
            </code>
          );
        }

        return (
          <div className="my-6">
            <div className="relative">
              <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-t border-l border-r border-border rounded-t-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {language || 'text'}
                </span>
              </div>
              <div className="custom-scrollbar border-b border-l border-r border-border rounded-b-lg overflow-hidden">
                <SyntaxHighlighter
                  style={selectedCodeStyle}
                  language={language || 'text'}
                  PreTag="div"
                  codeTagProps={{
                    className: 'font-mono',
                  }}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        );
      },
    },

    option: {
      // For options, we want inline rendering mostly
      p: ({ children }: ComponentProps) => (
        <span className="text-foreground">
          {children}
        </span>
      ),
      code: ({ children, className, inline, ...props }: ComponentProps) => {
        if (inline) {
          return (
            <code
              className={`px-1 py-0.5 ${isDarkMode ? 'bg-muted' : 'bg-muted/50'} rounded text-xs font-mono text-foreground border border-border/50 break-words`}
              {...props}
            >
              {children}
            </code>
          );
        }

        const match = /language-(\w+)/.exec(className || '');
        return (
          <div className="mt-2">
            <SyntaxHighlighter
              style={selectedCodeStyle}
              language={match ? match[1] : 'text'}
              PreTag="div"
              codeTagProps={{
                className: 'font-mono text-xs',
              }}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                fontSize: '0.75rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      },
    },

    analysis: {
      ...baseComponents,
      p: ({ children }: ComponentProps) => (
        <p className="mb-2 leading-relaxed text-foreground/75">
          {children}
        </p>
      ),
      code: ({ children, className, inline, node, ...props }: ComponentProps) => {
        const match = /language-(\w+)/.exec(className || '');

        if (inline) {
          return (
            <code
              className="bg-muted px-1 py-0.5 rounded break-words"
              {...props}
            >
              {children}
            </code>
          );
        }

        return !inline && match ? (
          <div className="my-2 overflow-x-auto scrollbar-hide text-xs md:text-base">
            <SyntaxHighlighter
              PreTag="div"
              codeTagProps={{}}
              customStyle={{
                margin: 0,
                borderRadius: "0.5rem",
                whiteSpace: "pre",
                display: "inline-block",
                minWidth: "fit-content",
                maxWidth: "100%",
              }}
              language={match[1]}
              style={selectedCodeStyle}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code
            className="bg-muted px-1 py-0.5 rounded break-words"
            {...props}
          >
            {children}
          </code>
        );
      },
    },

    minimal: {
      p: ({ children }: ComponentProps) => (
        <p className="mb-2 text-sm text-foreground/90">
          {children}
        </p>
      ),
      code: ({ children, inline }: ComponentProps) => {
        if (inline) {
          return (
            <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">
              {children}
            </code>
          );
        }
        return (
          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
            <code>{children}</code>
          </pre>
        );
      },
    },
  };

  // Common components used across all variants
  const commonComponents = {
    table: ({ children }: ComponentProps) => (
      <div className="my-6">
        <div className="overflow-hidden rounded-lg border border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {children}
            </table>
          </div>
        </div>
      </div>
    ),
    thead: ({ children }: ComponentProps) => (
      <thead className="bg-muted/50 border-b border-border">
        {children}
      </thead>
    ),
    th: ({ children }: ComponentProps) => (
      <th
        className="px-4 py-3 text-left text-sm font-semibold text-foreground 
                 border-r border-border last:border-r-0"
      >
        <div className="flex items-center">
          {children}
        </div>
      </th>
    ),
    tbody: ({ children }: ComponentProps) => (
      <tbody className="bg-card divide-y divide-border">
        {children}
      </tbody>
    ),
    td: ({ children }: ComponentProps) => (
      <td
        className="px-4 py-3 text-sm text-foreground/90 
                 border-b border-border border-r last:border-r-0"
      >
        {children}
      </td>
    ),
    tr: ({ children }: ComponentProps) => (
      <tr className="hover:bg-muted/30 transition-colors duration-150">
        {children}
      </tr>
    ),
    blockquote: ({ children }: ComponentProps) => (
      <blockquote className="my-6 pl-6 border-l-4 border-primary/30 bg-muted/30 py-2 rounded-r-lg">
        <div className="text-foreground/80 italic">
          {children}
        </div>
      </blockquote>
    ),
    ul: ({ children }: ComponentProps) => (
      <ul className={cn(
        "my-4 space-y-2",
        variant === 'minimal' && "my-2 space-y-1"
      )}>
        {children}
      </ul>
    ),
    ol: ({ children }: ComponentProps) => (
      <ol className={cn(
        "my-4 space-y-2",
        variant === 'minimal' && "my-2 space-y-1"
      )}>
        {children}
      </ol>
    ),
    li: ({ children }: ComponentProps) => (
      <li className="flex items-start gap-2 text-foreground/90">
        <span className={cn(
          "bg-primary rounded-full mt-2 flex-shrink-0",
          variant === 'minimal' ? "w-1 h-1" : "w-1.5 h-1.5"
        )}></span>
        <span className="flex-1">{children}</span>
      </li>
    ),
  };

  // Merge variant-specific components with common components and custom overrides
  const components = {
    ...variantComponents[variant],
    ...commonComponents,
    ...customComponents,
  };

  // Wrapper classes based on variant
  const getWrapperClasses = () => {
    const base = "prose max-w-none";

    switch (variant) {
      case 'question':
        return `${base} prose-lg`;
      case 'option':
        return `${base} prose-sm`;
      case 'analysis':
        return `${base} prose-sm`;
      case 'minimal':
        return `${base} prose-sm`;
      default:
        return `${base} prose-lg`;
    }
  };

  return (
    <div className={cn(getWrapperClasses(), className)}>
      <Markdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
};