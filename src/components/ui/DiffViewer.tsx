import type { ReactNode } from "react";

export interface DiffItem {
  id?: string;
  field: string;
  label?: ReactNode;
  oldValue: unknown;
  newValue: unknown;
}

interface DiffViewerProps {
  changes: DiffItem[];
  oldLabel?: string;
  newLabel?: string;
  emptyMessage?: string;
  className?: string;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export function DiffViewer({
  changes,
  oldLabel = "Old Value",
  newLabel = "New Value",
  emptyMessage = "No differences found.",
  className = "",
}: DiffViewerProps) {
  if (changes.length === 0) {
    return (
      <div
        className={`
          rounded-2xl
          border
          border-dashed
          border-gray-300
          bg-gray-50
          p-6
          text-center
          text-sm
          text-gray-500
          ${className}
        `}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {changes.map((change) => (
        <div
          key={change.id ?? change.field}
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <h4 className="mb-5 text-base font-semibold text-gray-900">
            {change.label ?? change.field}
          </h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Old Value */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600">
                {oldLabel}
              </p>

              <pre className="whitespace-pre-wrap break-words font-sans text-sm text-gray-700">
                {displayValue(change.oldValue)}
              </pre>
            </div>

            {/* New Value */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
                {newLabel}
              </p>

              <pre className="whitespace-pre-wrap break-words font-sans text-sm text-gray-700">
                {displayValue(change.newValue)}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}