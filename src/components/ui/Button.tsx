import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  onClick?: () => void;
};

const variantClasses = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200",

  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-4 focus:ring-gray-200",

  outline:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200",

  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-200",

  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100",
};

const sizeClasses = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  fullWidth = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        font-semibold
        shadow-sm
        transition-all
        duration-200
        active:scale-[0.98]
        focus:outline-none
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {loading && (
        <span
          className="
            h-4
            w-4
            animate-spin
            rounded-full
            border-2
            border-current
            border-t-transparent
          "
        />
      )}

      {loading ? "Loading..." : children}
    </button>
  );
}