"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  variant?: "ward" | "municipality" | "province" | "central";
}

export default function Sidebar({
  items,
  collapsed = false,
  variant = "ward",
}: SidebarProps) {
  const pathname = usePathname();

  const accentColors = {
    ward: "bg-green-500",
    municipality: "bg-orange-500",
    province: "bg-blue-500",
    central: "bg-red-500",
  };

  return (
    <aside
      className={`
        ${collapsed ? "w-20" : "w-64"}
        sticky
        top-0
        h-screen
        bg-white
        border-r
        border-gray-200
        shadow-sm
        transition-all
        duration-300
      `}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200">
        {!collapsed ? (
          <h2 className="text-lg font-bold text-gray-900">
            Digital Nepal
          </h2>
        ) : (
          <span className="text-xl font-bold text-blue-600">
            DN
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-2 overflow-y-auto p-4">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                transition-colors
                duration-200
                ${
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              {active && (
                <span
                  className={`
                    absolute
                    left-0
                    top-2
                    bottom-2
                    w-1
                    rounded-r-full
                    ${accentColors[variant]}
                  `}
                />
              )}

              {item.icon && (
                <span className="shrink-0 text-lg">
                  {item.icon}
                </span>
              )}

              {!collapsed && (
                <span className="truncate">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}