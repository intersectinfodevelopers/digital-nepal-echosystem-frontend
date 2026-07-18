interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  change,
  icon,
}: StatCardProps) {
  const isNegative = change?.startsWith("-");

  return (
    <div
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </h2>

          {change && (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                isNegative
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {change}
            </span>
          )}
        </div>

        {icon && (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}