"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "./Avatar";
import { TierBadge } from "./TierBadge";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  title?: string;
  items?: NavItem[];
  userName?: string;
  jurisdiction?: string;
  tier?: "WARD" | "MUNICIPALITY" | "PROVINCE" | "CENTRAL";
}

export default function Navbar({
  title = "Digital Nepal Ecosystem",
  items = [],
  userName = "Admin",
  jurisdiction = "Kathmandu",
  tier = "WARD",
}: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left */}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-gray-900">
            {title}
          </h1>

          <p className="text-sm text-gray-500">
            {jurisdiction}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          {items.length > 0 && (
            <nav className="hidden items-center gap-5 lg:flex">
              {items.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition ${
                      active
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <TierBadge tier={tier} />

          <div className="flex items-center gap-3 border-l border-gray-200 pl-5">
            <Avatar
              name={userName}
              size="sm"
            />

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">
                {userName}
              </p>

              <p className="text-xs text-gray-500">
                {jurisdiction}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="
              rounded-lg
              border
              border-red-200
              px-4
              py-2
              text-sm
              font-medium
              text-red-600
              transition-all
              hover:bg-red-50
              focus:outline-none
              focus:ring-2
              focus:ring-red-200
            "
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}