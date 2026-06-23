'use client';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  error?: string;
}

export function DatePicker({
  value,
  onChange,
  name,
  error,
}: DatePickerProps) {
  return (
    <div className="space-y-2">
      <input
        type="date"
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-lg border p-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}