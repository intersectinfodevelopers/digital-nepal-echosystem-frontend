type SpinnerProps = {
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-[3px]",
  lg: "w-10 h-10 border-4",
};

export function Spinner({
  size = "md",
}: SpinnerProps) {
  return (
    <div
      className={`
        inline-block
        animate-spin
        rounded-full
        border-solid
        border-gray-300
        border-t-blue-600
        ${sizeClasses[size]}
      `}
      role="status"
      aria-label="Loading"
    />
  );
}