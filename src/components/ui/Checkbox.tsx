'use client';

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
  name?: string;
  disabled?: boolean;
}

export function Checkbox({
  checked = false,
  indeterminate = false,
  label,
  onChange,
  name,
  disabled = false,
}: CheckboxProps) {
  return (
    <label
      className={`
        inline-flex
        items-center
        gap-2
        select-none
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        ref={(input) => {
          if (input) {
            input.indeterminate = indeterminate;
          }
        }}
        onChange={(e) => onChange?.(e.target.checked)}
        className="
          h-4
          w-4
          rounded
          border
          border-gray-300
          text-[#003893]
          focus:ring-2
          focus:ring-[#003893]
          focus:ring-offset-1
          transition-colors
          duration-200
        "
      />

      {label && (
        <span className="text-sm font-medium text-gray-600">
          {label}
        </span>
      )}
    </label>
  );
}