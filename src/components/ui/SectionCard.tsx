import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  description,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={`
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        transition-shadow
        duration-200
        hover:shadow-md
        ${className}
      `}
    >
      <header className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {description}
          </p>
        )}
      </header>

      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}