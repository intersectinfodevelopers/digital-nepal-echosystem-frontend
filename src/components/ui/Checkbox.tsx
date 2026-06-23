'use client';

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
  name?: string;
}

export function Checkbox({
  checked = false,
  indeterminate = false,
  label,
  onChange,
  name,
}: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        ref={(input) => {
          if (input) {
            input.indeterminate = indeterminate;
          }
        }}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4"
      />

      {label && (
        <span className="text-sm text-gray-700">
          {label}
        </span>
      )}
    </label>
  );
}