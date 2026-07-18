type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onPageSizeChange?: (size: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  pageSize = 10,
  onPrevious,
  onNext,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
      {/* Left */}
      <p className="text-sm text-gray-600">
        Page{" "}
        <span className="font-semibold text-gray-900">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900">
          {totalPages}
        </span>
      </p>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="
            rounded-lg
            border
            border-gray-300
            px-4
            py-2
            text-sm
            font-medium
            text-gray-700
            transition
            hover:bg-gray-100
            focus:outline-none
            focus:ring-2
            focus:ring-blue-200
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Previous
        </button>

        <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          {currentPage}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="
            rounded-lg
            border
            border-gray-300
            px-4
            py-2
            text-sm
            font-medium
            text-gray-700
            transition
            hover:bg-gray-100
            focus:outline-none
            focus:ring-2
            focus:ring-blue-200
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Next
        </button>

        <select
          value={pageSize}
          onChange={(e) =>
            onPageSizeChange?.(Number(e.target.value))
          }
          className="
            rounded-lg
            border
            border-gray-300
            bg-white
            px-3
            py-2
            text-sm
            text-gray-700
            focus:border-blue-500
            focus:outline-none
            focus:ring-2
            focus:ring-blue-200
          "
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>
    </div>
  );
}