import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // 최대 표시할 페이지 번호 개수

    if (totalPages <= maxVisible) {
      // 전체 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 첫 페이지
      pages.push(1);

      // 현재 페이지 주변 계산
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // 시작과 끝 조정
      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 3, 2);
      }

      // 첫 페이지와 시작 사이에 ... 추가
      if (start > 2) {
        pages.push("...");
      }

      // 중간 페이지들
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 끝과 마지막 페이지 사이에 ... 추가
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // 마지막 페이지
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* 이전 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 p-0"
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 페이지 번호 버튼들 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "h-9 min-w-9 px-3",
                isActive &&
                  "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
              )}
              aria-label={`페이지 ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      {/* 다음 페이지 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 p-0"
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

