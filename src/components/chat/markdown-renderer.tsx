"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose dark:prose-invert prose-zinc max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="my-2">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc ml-6 my-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-6 my-2">{children}</ol>
          ),
          li: ({ children }) => <li className="my-1">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} className="text-blue-500 hover:underline">
              {children}
            </a>
          ),
          code: ({ className, children, inline }) => {
            if (inline) {
              return (
                <code className="bg-zinc-100 dark:bg-zinc-800 rounded px-1 py-0.5 text-sm">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-zinc-100 dark:bg-zinc-800 rounded p-3 overflow-x-auto text-sm my-4">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-transparent p-0">{children}</pre>
          ),
          table: ({ children }) => (
            <table className="border-collapse my-4 w-full">{children}</table>
          ),
          th: ({ children }) => (
            <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 bg-zinc-100 dark:bg-zinc-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-2">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 italic my-4">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-6 border-zinc-300 dark:border-zinc-700" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
