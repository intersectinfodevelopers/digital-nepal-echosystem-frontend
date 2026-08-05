"use client";

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DatePicker({
  label,
  value,
  onChange,
  name,
  error,
  required = false,
  disabled = false,
}: DatePickerProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <input
        type="date"
        name={name}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          h-12
          w-full
          rounded-xl
          border
          bg-white
          px-4
          text-sm
          text-gray-900
          outline-none
          appearance-none
          transition-all
          duration-200
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 focus:border-[#003893] focus:ring-2 focus:ring-blue-200"
          }
          ${
            disabled
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : ""
          }
        `}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}