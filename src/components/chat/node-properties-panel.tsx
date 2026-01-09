"use client";

import React from "react";

export type NodeProperties = Record<string, string | number | null>;

export interface SelectedGraphNode {
  id: string;
  label: string;
  nodeType?: string;
  properties?: NodeProperties;
  isPlaceholder?: boolean;
}

interface NodePropertiesPanelProps {
  node: SelectedGraphNode;
  onClose: () => void;
}

function isLikelyJsonText(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function tryParseJson(value: string): unknown | null {
  if (!isLikelyJsonText(value)) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function renderValue(key: string, value: string | number | null) {
  if (value === null) {
    return <span className="text-zinc-400">-</span>;
  }

  if (typeof value === "number") {
    return <span className="font-mono">{formatNumber(value)}</span>;
  }

  const trimmed = value.trim();
  const parsedJson = tryParseJson(trimmed);
  if (parsedJson !== null) {
    const pretty = JSON.stringify(parsedJson, null, 2);
    return (
      <details className="group">
        <summary className="cursor-pointer select-none text-xs text-indigo-600 dark:text-indigo-300 hover:underline">
          JSON 보기
        </summary>
        <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-zinc-100 dark:bg-zinc-900 p-2 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
          {pretty}
        </pre>
      </details>
    );
  }

  const isUrl = key.toLowerCase().includes("url") || /^https?:\/\//i.test(trimmed);
  if (isUrl) {
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-blue-600 dark:text-blue-300 hover:underline break-all"
      >
        {trimmed}
      </a>
    );
  }

  const isLongText = trimmed.length > 120;
  if (isLongText) {
    const preview = `${trimmed.slice(0, 120)}…`;
    return (
      <details className="group">
        <summary className="cursor-pointer select-none text-xs text-zinc-700 dark:text-zinc-200">
          {preview}
        </summary>
        <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-zinc-100 dark:bg-zinc-900 p-2 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
          {trimmed}
        </pre>
      </details>
    );
  }

  return <span className="text-xs break-all">{trimmed}</span>;
}

export function NodePropertiesPanel({ node, onClose }: NodePropertiesPanelProps) {
  const entries = Object.entries(node.properties ?? {});

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate" title={node.label}>
            {node.label}
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {node.nodeType ? (
              <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-700 dark:text-zinc-200">
                {node.nodeType}
              </span>
            ) : null}
            {node.isPlaceholder ? (
              <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-[11px] text-amber-700 dark:text-amber-300">
                임시 노드
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-full bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              {node.id}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          닫기
        </button>
      </div>

      <div className="mt-3">
        {entries.length === 0 ? (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            표시할 속성이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-12 gap-2 rounded-lg border border-zinc-200/70 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 px-3 py-2"
              >
                <div className="col-span-4 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 break-all">
                  {key}
                </div>
                <div className="col-span-8 text-zinc-800 dark:text-zinc-100">
                  {renderValue(key, value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


