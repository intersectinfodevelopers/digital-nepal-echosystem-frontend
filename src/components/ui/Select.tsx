'use client';

import { useMemo, useState } from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
}

export function Select({
  options,
  placeholder = 'Select an option',
  error,
  searchable = false,
  value,
  onChange,
  name,
}: SelectProps) {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchable || !search) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, searchable]);

  return (
    <div className="space-y-2">
      {searchable && (
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border p-2"
        />
      )}

      <select
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-lg border p-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">{placeholder}</option>

        {filteredOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}