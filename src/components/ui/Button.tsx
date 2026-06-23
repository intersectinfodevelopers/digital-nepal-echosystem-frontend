type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

const variantClasses = {
  primary: "bg-blue-600 text-white",
  secondary: "bg-gray-200 text-gray-800",
  outline: "border border-gray-300 text-gray-700",
  danger: "bg-red-600 text-white",
  ghost: "text-gray-600",
};

const sizeClasses = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-lg font-medium transition
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${(disabled || loading) ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}