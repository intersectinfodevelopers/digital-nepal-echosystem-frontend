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
    return JSON.stringify(value);
  }

  return String(value);
}

export function DiffViewer({
  changes,
  oldLabel = "OLD VALUE",
  newLabel = "NEW VALUE",
  emptyMessage = "No differences found.",
  className = "",
}: DiffViewerProps) {
  if (changes.length === 0) {
    return (
      <div className={`rounded-xl border p-4 text-sm text-slate-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {changes.map((change) => (
        <div
          key={change.id ?? change.field}
          className="border rounded-xl p-4"
        >
          <h4 className="font-semibold mb-3">
            {change.label ?? change.field}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-red-100 p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">
                {oldLabel}
              </p>

              <p>{displayValue(change.oldValue)}</p>
            </div>

            <div className="rounded-lg bg-green-100 p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">
                {newLabel}
              </p>

              <p>{displayValue(change.newValue)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
