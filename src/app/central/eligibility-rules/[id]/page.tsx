"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import rulesData from "../../../../../data/eligibility-rules.json";

interface ConditionExpr {
  field?: string;
  operator?: string;
  value?: string | number | boolean;
  and?: ConditionExpr;
}

interface Rule {
  id: string;
  rule_name: string;
  benefit_type: string;
  condition_expression: ConditionExpr;
  benefit_value: Record<string, unknown>;
  priority: number;
  is_active: boolean;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const MOCK_METRICS: Record<
  string,
  {
    count: number;
    history: Array<{ date: string; user: string; action: string }>;
  }
> = {
  default: {
    count: 1420,
    history: [
      {
        date: "2026-03-12 14:22",
        user: "Admin Narayan",
        action: "Created Rule Baseline",
      },
      {
        date: "2026-05-19 09:11",
        user: "System Auditor",
        action: "Updated Priority Evaluation Matrix",
      },
    ],
  },
};

export default function RuleDetailPage({ params }: PageProps) {
  // Unwrap Next.js 15+ asynchronous parameters safely
  const resolvedParams = use(params);

  // Directly calculate data during execution pass—avoiding side effects loops entirely
  const rule = rulesData.find((r) => r.id === resolvedParams.id) as
    | Rule
    | undefined;

  if (!rule) {
    notFound();
  }

  const metrics = MOCK_METRICS[rule.id] || MOCK_METRICS.default;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-6">
        <Link
          href="/central/eligibility-rules"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to Rules Dashboard
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {rule.rule_name}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${rule.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}
          >
            {rule.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Rules & Criteria */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 shadow rounded-xl border">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Rule Details
            </h2>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border mb-4 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Benefit Type
                </p>
                <p className="font-medium mt-0.5">{rule.benefit_type}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Priority Level
                </p>
                <p className="font-medium mt-0.5">{rule.priority}</p>
              </div>
            </div>

            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Formatted Condition Statement
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-xs border text-gray-700 leading-relaxed whitespace-pre-wrap">
              {JSON.stringify(rule.condition_expression, null, 2)}
            </div>
          </div>

          <div className="bg-white p-6 shadow rounded-xl border">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Targeted Benefit Payload
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-xs border text-gray-700">
              {JSON.stringify(rule.benefit_value, null, 2)}
            </div>
          </div>
        </div>

        {/* Right Column: Audit Logs & Citizen Scopes */}
        <div className="space-y-6">
          <div className="bg-white p-6 shadow rounded-xl border text-center">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Affected Citizen Count
            </h2>
            <p className="text-4xl font-extrabold text-blue-600">
              {metrics.count.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Active records evaluated under this logical query branch.
            </p>
          </div>

          <div className="bg-white p-6 shadow rounded-xl border">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Modification Audit Log History
            </h2>
            <div className="flow-root">
              <ul className="-mb-8 divide-y divide-gray-100">
                {metrics.history.map((log, logIdx) => (
                  <li key={logIdx} className="py-3">
                    <div className="flex flex-col space-y-1">
                      <div className="text-xs text-gray-500 font-mono">
                        {log.date}
                      </div>
                      <div className="text-sm font-semibold text-gray-800">
                        {log.action}
                      </div>
                      <div className="text-xs text-gray-400">
                        By: {log.user}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
