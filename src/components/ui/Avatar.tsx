import Image from "next/image";

type AvatarProps = {
  name: string;
  image?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-lg",
};

export function Avatar({
  name,
  image,
  size = "md",
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={56}
        height={56}
        className={`
          ${sizeClasses[size]}
          rounded-full
          object-cover
          border
          border-gray-200
        `}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        flex
        items-center
        justify-center
        rounded-full
        bg-gray-100
        border
        border-gray-200
        text-gray-700
        font-semibold
        select-none
      `}
    >
      {initials}
    </div>
  );
}