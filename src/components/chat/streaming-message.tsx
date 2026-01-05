"use client";

import { useEffect, useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";
import { Message, LOADING_TIPS } from "./types";

interface StreamingMessageProps {
  message: Message;
}

// 분석 단계별 아이콘 (이모지)
const STEP_ICONS: Record<string, string> = {
  "작업을 분배하고 있어요": "🎯",
  "시장 동향을 분석하고 있어요": "📊",
  "기업 펀더멘털을 분석하고 있어요": "🏢",
  "기술적 지표를 분석하고 있어요": "📈",
  "재무제표를 살펴보고 있어요": "📋",
  "종목 데이터를 분석하고 있어요": "🔍",
  "주가 흐름을 예측하고 있어요": "🔮",
  "차트 패턴을 분석하고 있어요": "📉",
  "증권사 리포트를 검색하고 있어요": "📰",
  "관련 뉴스를 수집하고 있어요": "📡",
  "금융 지식 그래프를 탐색하고 있어요": "🌐",
  "리포트 감성을 분석하고 있어요": "💭",
};

export function StreamingMessage({ message }: StreamingMessageProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState("");

  // 로딩 팁 순환
  useEffect(() => {
    if (!message.progressStep) return;

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, [message.progressStep]);

  // 점 애니메이션
  useEffect(() => {
    if (!message.progressStep) return;

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => clearInterval(dotsInterval);
  }, [message.progressStep]);

  // 실제 컨텐츠가 있으면 마크다운으로 렌더링
  if (message.content && message.content.length > 0 && !message.progressStep) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-xl p-3 bg-zinc-100 dark:bg-zinc-700/60 text-zinc-800 dark:text-zinc-200 shadow-sm">
          <MarkdownRenderer content={message.content} />
          <p className="mt-1 text-right text-[10px] opacity-60">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  }

  // progressStep이 있거나 컨텐츠가 비어있으면 로딩 UI 표시
  const stepIcon = message.progressStep
    ? STEP_ICONS[message.progressStep] || "⚡"
    : "💬";

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-xl overflow-hidden shadow-sm">
        {/* 그라데이션 헤더 */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-lg animate-bounce">{stepIcon}</span>
            <span className="text-white text-sm font-medium">
              {message.progressStep || "응답 생성 중"}
              <span className="inline-block w-6 text-left">{dots}</span>
            </span>
          </div>
        </div>

        {/* 본문 영역 */}
        <div className="bg-zinc-100 dark:bg-zinc-700/60 px-4 py-3">
          {/* 컨텐츠가 있으면 함께 표시 */}
          {message.content && message.content.length > 0 ? (
            <div className="mb-3">
              <MarkdownRenderer content={message.content} />
            </div>
          ) : null}

          {/* 로딩 애니메이션 */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div
                className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"
                style={{ animationDelay: "300ms" }}
              />
            </div>

            {/* 랜덤 팁 표시 */}
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic animate-fade-in">
              💡 {LOADING_TIPS[tipIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

