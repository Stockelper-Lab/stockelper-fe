import { Button } from "@/components/ui/button";

export type SubmitButtonProps = {
  isLoading: boolean;
  text: string;
  loadingText: string;
};

export const SubmitButton = ({
  isLoading,
  text,
  loadingText,
}: SubmitButtonProps) => (
  <Button
    type="submit"
    className="w-full py-6 text-base font-medium rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md bg-gradient-to-r from-blue-600 to-indigo-600"
    disabled={isLoading}
  >
    {isLoading ? loadingText : text}
  </Button>
);
