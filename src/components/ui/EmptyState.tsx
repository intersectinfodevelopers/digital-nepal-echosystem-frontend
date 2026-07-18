import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function EmptyState({
  icon,
  title = "Nothing here",
  message = "No data found.",
  ctaText,
  onCtaClick,
}: EmptyStateProps) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-gray-300
        bg-gray-50
        px-6
        py-12
        text-center
      "
    >
      {icon && (
        <div
          className="
            mb-4
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-blue-100
            text-blue-600
          "
        >
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {message}
      </p>

      {ctaText && (
        <button
          type="button"
          onClick={onCtaClick}
          className="
            mt-6
            rounded-xl
            bg-blue-600
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition-all
            duration-200
            hover:bg-blue-700
            active:scale-[0.98]
          "
        >
          {ctaText}
        </button>
      )}
    </div>
  );
}