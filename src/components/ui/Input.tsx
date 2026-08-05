import React from "react";

type InputProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function Input({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div
        className={`flex items-center h-12 rounded-xl border bg-white px-4 transition-all ${
          error
            ? "border-red-500"
            : "border-slate-300 focus-within:border-blue-600"
        } focus-within:ring-4 focus-within:ring-blue-100 ${
          disabled ? "bg-slate-100 cursor-not-allowed" : ""
        }`}
      >
        {leftIcon && <span className="mr-3 text-slate-500">{leftIcon}</span>}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
        />

        {rightIcon && <span className="ml-3 text-slate-500">{rightIcon}</span>}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}