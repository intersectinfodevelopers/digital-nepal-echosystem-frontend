import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  actions?: (item: T) => ReactNode;
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data found",
  actions,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 font-medium text-gray-600"
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-gray-900"
                >
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, ReactNode>)[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3">
                  {actions(item)}
                </td>
              )}
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
