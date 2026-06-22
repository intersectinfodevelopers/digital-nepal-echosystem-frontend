import Image from "next/image";

type AvatarProps = {
  name: string;
  image?: string;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ name, image, size = "md" }: AvatarProps) {
  const initials = name.slice(0, 2);
  const sizeMap = { sm: 32, md: 48, lg: 64 };
  const px = sizeMap[size];

  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={px}
        height={px}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold`}
      style={{ width: px, height: px, fontSize: px * 0.4 }}
    >
      {initials}
    </div>
  );
}
