"use client";

interface TextareaProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  error?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export function Textarea({
  label,
  value = "",
  onChange,
  maxLength,
  error,
  placeholder,
  name,
  required = false,
  disabled = false,
  rows = 4,
}: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          w-full
          rounded-xl
          border
          px-4
          py-3
          text-sm
          text-gray-900
          placeholder:text-gray-400
          resize-y
          outline-none
          transition
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }
          ${
            disabled
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-white"
          }
        `}
      />

      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-sm text-red-500">
            {error}
          </p>
        ) : (
          <div />
        )}

        {maxLength && (
          <p className="text-xs text-gray-500">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}