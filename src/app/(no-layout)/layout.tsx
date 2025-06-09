"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function NoLayoutRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait" initial={false}>
        <div key={pathname}>{children}</div>
      </AnimatePresence>
    </div>
  );
}
