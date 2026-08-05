interface TierBadgeProps {
  tier: "WARD" | "MUNICIPALITY" | "PROVINCE" | "CENTRAL";
}

const styles = {
  WARD: "bg-green-50 text-green-700 border-green-200",
  MUNICIPALITY: "bg-orange-50 text-orange-700 border-orange-200",
  PROVINCE: "bg-blue-50 text-blue-700 border-blue-200",
  CENTRAL: "bg-red-50 text-red-700 border-red-200",
};

export function TierBadge({
  tier,
}: TierBadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        uppercase
        tracking-wide
        whitespace-nowrap
        shadow-sm
        ${styles[tier]}
      `}
    >
      {tier}
    </span>
  );
}