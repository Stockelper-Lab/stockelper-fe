import { Button } from "@/components/ui/button";

// 제출 버튼 컴포넌트
type SubmitButtonProps = {
  isLoading?: boolean;
  text: string;
  loadingText?: string;
  className?: string;
};

export const SubmitButton = ({
  isLoading = false,
  text,
  loadingText = "처리 중...",
  className = "",
}: SubmitButtonProps) => (
  <Button type="submit" className={`w-full ${className}`} disabled={isLoading}>
    {isLoading ? loadingText : text}
  </Button>
);
