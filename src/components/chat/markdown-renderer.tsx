"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // content가 변경될 때마다 ReactMarkdown이 완전히 리렌더링되도록 key 사용
  const contentKey = `${content.length}-${content.slice(-10)}`;

  return (
    <div className="prose prose-sm dark:prose-invert prose-zinc max-w-none">
      <ReactMarkdown
        key={contentKey}
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mt-3 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold mt-2 mb-1.5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>
          ),
          p: ({ children }) => <p className="my-1 text-xs leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc ml-5 my-1.5 text-xs">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-5 my-1.5 text-xs">{children}</ol>
          ),
          li: ({ children }) => <li className="my-0.5 text-xs">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} className="text-blue-500 hover:underline">
              {children}
            </a>
          ),
          // strong (볼드체) 명시적 정의
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          // em (이탤릭체) 명시적 정의
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, ...props }) => {
            const inline = "inline" in props && props.inline;
            if (inline) {
              return (
                <code className="bg-zinc-100 dark:bg-zinc-800 rounded px-1 py-0.5 text-xs">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-zinc-100 dark:bg-zinc-800 rounded p-2 overflow-x-auto text-xs my-2">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-transparent p-0">{children}</pre>
          ),
          table: ({ children }) => (
            <table className="border-collapse my-2 w-full text-xs">{children}</table>
          ),
          th: ({ children }) => (
            <th className="border border-zinc-300 dark:border-zinc-700 px-2 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-zinc-300 dark:border-zinc-700 px-2 py-1.5 text-xs">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-3 italic my-2 text-xs">
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
