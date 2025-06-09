import { CheckboxOption } from "./CheckboxOption";

export type CheckboxGroupComponentProps = {
  values: number[];
  onChange: (value: number) => void;
  options: { id: string; value: number; label: string }[];
  themeColor: {
    bg: string;
    text: string;
    ring: string;
    accent: string;
  };
};

export const CheckboxGroupComponent = ({
  values,
  onChange,
  options,
  themeColor,
}: CheckboxGroupComponentProps) => (
  <div className="flex flex-col space-y-3">
    {options.map((option) => (
      <CheckboxOption
        key={option.id}
        id={option.id}
        value={option.value}
        label={option.label}
        isChecked={values.includes(option.value)}
        onClick={() => onChange(option.value)}
        activeColor={themeColor.text}
        activeBg={themeColor.bg}
        activeRing={themeColor.ring}
        accentColor={themeColor.accent}
      />
    ))}
  </div>
);
