import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// 라디오 옵션 컴포넌트
type RadioOptionProps = {
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

// 체크박스 옵션 컴포넌트
type CheckboxOptionProps = {
  id: string;
  label: string;
  isChecked: boolean;
  onClick: () => void;
  activeColor: string;
  activeBg: string;
  activeRing: string;
  accentColor: string;
};
export const CheckboxOption = ({
  id,
  label,
  isChecked,
  onClick,
  activeColor,
  activeBg,
  activeRing,
  accentColor,
}: CheckboxOptionProps) => (
  <label
    htmlFor={id}
    onClick={onClick}
    className={`flex items-center p-4 rounded-lg transition-all duration-200 cursor-pointer
      ${
        isChecked
          ? `${activeBg} ${activeColor} font-medium ring-1 ${activeRing}`
          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
      }`}
  >
    <input
      type="checkbox"
      id={id}
      checked={isChecked}
      onChange={onClick} // onClick 핸들러를 직접 연결
      className={`h-4 w-4 shrink-0 rounded-sm ${accentColor} mr-3`}
    />
    <span className="text-sm cursor-pointer">{label}</span>
  </label>
);

// 라디오 그룹 컴포넌트
type RadioGroupComponentProps = {
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
  <RadioGroup
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
  </RadioGroup>
);

// 체크박스 그룹 컴포넌트
type CheckboxGroupComponentProps = {
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
