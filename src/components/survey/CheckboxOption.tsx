export type CheckboxOptionProps = {
  id: string;
  value: number;
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
      onChange={() => {}} // 변경은 onClick에서 처리됨
      className={`h-4 w-4 shrink-0 rounded-sm ${accentColor} mr-3`}
    />
    <span className="text-sm">{label}</span>
  </label>
);
