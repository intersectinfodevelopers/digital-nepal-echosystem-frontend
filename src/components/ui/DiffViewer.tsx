'use client';

interface DiffItem {
  field: string;
  oldValue: string;
  newValue: string;
}

interface DiffViewerProps {
  changes: DiffItem[];
}

export function DiffViewer({
  changes,
}: DiffViewerProps) {
  return (
    <div className="space-y-4">
      {changes.map((change) => (
        <div
          key={change.field}
          className="border rounded-xl p-4"
        >
          <h4 className="font-semibold mb-3">
            {change.field}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-red-100 p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">
                OLD VALUE
              </p>

              <p>{change.oldValue}</p>
            </div>

            <div className="rounded-lg bg-green-100 p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">
                NEW VALUE
              </p>

              <p>{change.newValue}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}