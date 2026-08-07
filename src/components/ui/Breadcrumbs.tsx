"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";

type BreadcrumbItem = {
  label: string;
  href: string;
};

const ROUTE_LABELS: Record<string, string> = {
  central: "Central",
  province: "Province",
  municipality: "Municipality",
  ward: "Ward",
  admin: "Admin",
  auth: "Authentication",
  login: "Login",
  dashboard: "Dashboard",
  analytics: "Analytics",
  "national-map": "National Map",
  "province-admins": "Province Admins",
  "eligibility-rules": "Eligibility Rules",
  "audit-log": "Audit Log",
  "policy-cards": "Policy Cards",
  citizens: "Citizens",
  "id-cards": "ID Cards",
  sync: "Sync",
  grievances: "Grievances",
  grievences: "Grievances",
  verify: "Verify",
  unauthorized: "Unauthorized",
  "edit-approvals": "Edit Approvals",
  conflicts: "Conflicts",
};

const DETAIL_LABELS: Record<string, string> = {
  citizens: "Citizen Details",
  "id-cards": "ID Card Details",
  "eligibility-rules": "Rule Details",
  conflicts: "Conflict Details",
  grievances: "Grievance Details",
  grievences: "Grievance Details",
  sync: "Sync Details",
  verify: "Verification",
  "edit-approvals": "Approval Details",
};

const titleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const isDynamicSegment = (segment: string) =>
  /^\d+$/.test(segment) ||
  /^[0-9a-f]{8,}$/i.test(segment) ||
  /^[0-9a-f-]{16,}$/i.test(segment);

function resolveLabel(segment: string, previousSegment?: string) {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  if (isDynamicSegment(segment)) {
    if (previousSegment && DETAIL_LABELS[previousSegment]) {
      return DETAIL_LABELS[previousSegment];
    }
    return "Details";
  }
  return titleCase(segment);
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  const items = useMemo<BreadcrumbItem[]>(() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
    let href = "";

    segments.forEach((segment, index) => {
      href += `/${segment}`;
      crumbs.push({
        label: resolveLabel(segment, segments[index - 1]),
        href,
      });
    });

    return crumbs;
  }, [pathname]);

  if (items.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={item.href}>
            {index > 0 && <span className="text-slate-300">/</span>}
            {isLast ? (
              <span className="font-medium text-slate-900">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="transition-colors hover:text-slate-900"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
