'use client';

interface TextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  error?: string;
  placeholder?: string;
  name?: string;
}

export function Textarea({
  value = '',
  onChange,
  maxLength,
  error,
  placeholder,
  name,
}: TextareaProps) {
  return (
    <div className="space-y-2">
      <textarea
        name={name}
        value={value}
        placeholder={placeholder}
        rows={4}
        maxLength={maxLength}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-lg border p-3 resize-y ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />

      {maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}