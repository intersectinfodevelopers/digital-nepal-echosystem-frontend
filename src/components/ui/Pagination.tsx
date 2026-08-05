"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
}; 

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const getVisiblePages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {totalItems !== undefined && pageSize && (
          <span>
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}–
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </span>
        )}
        {onPageSizeChange && pageSize && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        {getVisiblePages().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
