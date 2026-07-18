type BadgeProps = {
  status: "SYNCED" | "PENDING" | "CONFLICT" | "VERIFIED" | "ARCHIVED";
};

const badgeVariants = {
  SYNCED:
    "bg-green-100 text-green-700 border border-green-200",

  PENDING:
    "bg-yellow-100 text-yellow-700 border border-yellow-200",

  CONFLICT:
    "bg-red-100 text-red-700 border border-red-200",

  VERIFIED:
    "bg-blue-100 text-blue-700 border border-blue-200",

  ARCHIVED:
    "bg-gray-100 text-gray-600 border border-gray-200",
};

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-md
        px-2.5
        py-1
        text-xs
        font-medium
        whitespace-nowrap
        ${badgeVariants[status]}
      `}
    >
      {status}
    </span>
  );
}