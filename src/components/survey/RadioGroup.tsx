import { RadioGroup as UIRadioGroup } from "@/components/ui/radio-group";
import { RadioOption } from "./RadioOption";

export type RadioGroupComponentProps = {
  value: string | null;
  onValueChange: (value: string) => void;
  options: { id: string; value: string; label: string }[];
  themeColor: {
    bg: string;
    text: string;
    ring: string;
  };
  columns?: number;
  centerItems?: boolean;
};

export const RadioGroupComponent = ({
  value,
  onValueChange,
  options,
  themeColor,
  columns = 2,
  centerItems = true,
}: RadioGroupComponentProps) => (
  <UIRadioGroup
    value={value?.toString() || undefined}
    onValueChange={onValueChange}
    className={`${
      columns > 1 ? `grid grid-cols-${columns}` : "flex flex-col"
    } gap-3`}
  >
    {options.map((option) => (
      <RadioOption
        key={option.id}
        id={option.id}
        value={option.value}
        label={option.label}
        currentValue={value?.toString() || null}
        activeColor={themeColor.text}
        activeBg={themeColor.bg}
        activeRing={themeColor.ring}
        centerItems={centerItems}
      />
    ))}
  </UIRadioGroup>
);
