"use client";

import { useMemo, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Select({
  label,
  options,
  placeholder = "Select",
  error,
  searchable = false,
  value,
  onChange,
  name,
  required = false,
  disabled = false,
}: SelectProps) {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchable || !search) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, searchable]);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      {searchable && (
        <input
          type="text"
          placeholder="Search..."
          value={search}
          disabled={disabled}
          onChange={(e) => setSearch(e.target.value)}
          className={`
            mb-3
            h-11
            w-full
            rounded-xl
            border
            bg-white
            px-4
            text-sm
            outline-none
            transition-all
            duration-200
            ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            }
            ${
              disabled
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : ""
            }
          `}
        />
      )}

      <select
        name={name}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          h-11
          w-full
          rounded-xl
          border
          bg-white
          px-4
          text-sm
          text-gray-900
          outline-none
          transition-all
          duration-200
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          }
          ${
            disabled
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : ""
          }
        `}
      >
        <option value="">{placeholder}</option>

        {filteredOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}