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
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data found",
}: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="
                    whitespace-nowrap
                    border-b
                    border-gray-200
                    px-6
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                  "
                >
                  {col.header}
                </th>
              ))}

              <th
                scope="col"
                className="
                  whitespace-nowrap
                  border-b
                  border-gray-200
                  px-6
                  py-4
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                "
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="
                    border-b
                    border-gray-100
                    transition-colors
                    hover:bg-blue-50
                    last:border-b-0
                  "
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-gray-700"
                    >
                      {col.render
                        ? col.render(item)
                        : (item as Record<string, ReactNode>)[col.key]}
                    </td>
                  ))}

                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-1.5
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-100
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-200
                      "
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}