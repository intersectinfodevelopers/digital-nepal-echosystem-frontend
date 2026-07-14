import type { ReactNode } from "react";

type CardProps = {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  accentColor?: string;
  className?: string;
};

export default function Card({
  header,
  children,
  footer,
  accentColor = "border-blue-500",
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        w-full
        rounded-2xl
        border
        border-gray-200
        border-l-4
        ${accentColor}
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-lg
        ${className}
      `}
    >
      {header && (
        <div className="mb-5 border-b border-gray-100 pb-4">
          {header}
        </div>
      )}

      <div className="space-y-4">
        {children}
      </div>

      {footer && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}