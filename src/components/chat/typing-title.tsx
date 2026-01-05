"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TypingTitleProps {
  title: string;
  isTyping: boolean;
  className?: string;
}

// 타이핑 애니메이션이 적용된 제목 컴포넌트
export function TypingTitle({ title, isTyping, className = "" }: TypingTitleProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={title}
        className={className}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.5 }}
      >
        {title}
        {isTyping && (
          <motion.span
            className="inline-block ml-0.5 w-[2px] h-[1em] bg-current align-middle"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.span>
    </AnimatePresence>
  );
}

