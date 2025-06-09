import { RadioGroupItem } from "@/components/ui/radio-group";

export type RadioOptionProps = {
  id: string;
  value: string;
  label: string;
  currentValue: string | null;
  activeColor: string;
  activeBg: string;
  activeRing: string;
  centerItems?: boolean;
};

export const RadioOption = ({
  id,
  value,
  label,
  currentValue,
  activeColor,
  activeBg,
  activeRing,
  centerItems = true,
}: RadioOptionProps) => (
  <label
    htmlFor={id}
    className={`flex items-${
      centerItems ? "center justify-center" : "start"
    } p-${centerItems ? "3" : "4"} rounded-lg transition-all duration-200 
      ${
        currentValue === value
          ? `${activeBg} ${activeColor} font-medium ring-1 ${activeRing}`
          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
      }`}
  >
    <RadioGroupItem value={value} id={id} className="sr-only" />
    <span className="text-sm">{label}</span>
  </label>
);
