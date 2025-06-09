"use client";

import { StockInfo } from "./use-chat";

interface StockInfoDisplayProps {
  stockInfo: StockInfo;
}

export function StockInfoDisplay({ stockInfo }: StockInfoDisplayProps) {
  const isPositive = stockInfo.change > 0;
  const changeColorClass = isPositive
    ? "text-green-500 dark:text-green-400"
    : "text-red-500 dark:text-red-400";

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-800/70 shadow-sm shrink-0">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {stockInfo.name} ({stockInfo.code})
      </h3>

      <div className="mt-2 space-y-1">
        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {stockInfo.price.toLocaleString()}원
        </p>

        <div className={`flex items-center ${changeColorClass}`}>
          <span className="font-medium text-sm">
            {isPositive ? "+" : ""}
            {stockInfo.change.toLocaleString()}원
          </span>
          <span className="mx-1">|</span>
          <span>
            {isPositive ? "+" : ""}
            {stockInfo.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
