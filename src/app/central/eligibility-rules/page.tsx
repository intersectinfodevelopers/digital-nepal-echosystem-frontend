"use client";

import { useState } from "react";
import Link from "next/link";
import rulesData from "../../../../data/eligibility-rules.json";

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

const BADGES: Record<string, string> = {
  UNEMPLOYMENT_ID: "bg-amber-100 text-amber-800 border-amber-200",
  DISABILITY_ID: "bg-blue-100 text-blue-800 border-blue-200",
  SENIOR_CITIZEN: "bg-green-100 text-green-800 border-green-200",
  SINGLE_WOMAN: "bg-pink-100 text-pink-800 border-pink-200",
  FOOD_SUBSIDY: "bg-orange-100 text-orange-800 border-orange-200",
  HEALTH_INSURANCE: "bg-teal-100 text-teal-800 border-teal-200",
};

const toEnglish = (expr: ConditionExpr | undefined): string => {
  if (!expr?.field) return "No conditions";
  const field = expr.field.split(".").pop()?.replace(/_/g, " ") || "";
  const op =
    { ">=": "≥", "<=": "≤", "=": "is" }[expr.operator as string] ||
    expr.operator;
  const txt =
    typeof expr.value === "boolean"
      ? expr.value
        ? `Must have ${field}`
        : `No ${field}`
      : `${field} ${op} ${expr.value}`;
  return expr.and ? `${txt} AND ${toEnglish(expr.and)}` : txt;
};

const DEFAULT_FORM = {
  rule_name: "",
  benefit_type: "UNEMPLOYMENT_ID",
  condition_json:
    '{\n  "field": "citizen.age",\n  "operator": ">=",\n  "value": 18\n}',
  benefit_json: '{\n  "card_type": "STANDARD"\n}',
  priority: 40,
  is_active: true,
};

export default function EligibilityRulesPage() {
  const [data, setData] = useState<Rule[]>(
    () => [...rulesData].sort((a, b) => a.priority - b.priority) as Rule[],
  );

  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const toggleStatus = () => {
    if (!selectedRule) return;
    const updated = data.map((r) =>
      r.id === selectedRule.id ? { ...r, is_active: !r.is_active } : r,
    );
    setData(updated);
    setSelectedRule(null);
  };

  const movePriority = (i: number, dir: 1 | -1) => {
    if (i + dir < 0 || i + dir >= data.length) return;

    const sorted = data
      .map((rule, idx) => {
        if (idx === i) return { ...data[i + dir], priority: data[i].priority };
        if (idx === i + dir)
          return { ...data[i], priority: data[i + dir].priority };
        return rule;
      })
      .sort((a, b) => a.priority - b.priority);

    setData(sorted);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);

    try {
      const condition_expression = JSON.parse(formData.condition_json);
      const benefit_value = JSON.parse(formData.benefit_json);

      const newRule: Rule = {
        id: `rule-${Date.now()}`,
        rule_name: formData.rule_name,
        benefit_type: formData.benefit_type,
        condition_expression,
        benefit_value,
        priority: Number(formData.priority),
        is_active: formData.is_active,
      };

      const updated = [...data, newRule].sort(
        (a, b) => a.priority - b.priority,
      );
      setData(updated);
      setShowCreate(false);
      setFormData(DEFAULT_FORM);
    } catch {
      // Removed unused 'err' identifier to resolve compiler warning layout tracks
      setJsonError(
        "Invalid JSON structure format syntax. Check formatting tags.",
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Eligibility Rules</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Create Rule
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              {[
                "Rule Name",
                "Benefit Type",
                "Condition Summary",
                "Priority",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="p-3 font-semibold text-gray-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((rule, i) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{rule.rule_name}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${BADGES[rule.benefit_type] || "bg-gray-100"}`}
                  >
                    {rule.benefit_type}
                  </span>
                </td>
                <td className="p-3 text-gray-600 capitalize">
                  {toEnglish(rule.condition_expression)}
                </td>
                <td className="p-3 flex items-center gap-3">
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {rule.priority}
                  </span>
                  <div className="flex flex-col text-gray-400 text-xs select-none">
                    <span
                      onClick={() => movePriority(i, -1)}
                      className="cursor-pointer hover:text-gray-700"
                    >
                      ▲
                    </span>
                    <span
                      onClick={() => movePriority(i, 1)}
                      className="cursor-pointer hover:text-gray-700"
                    >
                      ▼
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => setSelectedRule(rule)}
                    className={`px-3 py-1 rounded-full text-white text-xs font-medium transition ${rule.is_active ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"}`}
                  >
                    {rule.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3">
                  <Link
                    href={`/central/eligibility-rules/${rule.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CONFIRMATION MODAL */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl w-full max-w-md text-sm shadow-xl border">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Rule Change
            </h3>
            <p className="mb-6 text-gray-600 leading-relaxed">
              Disabling this rule will stop automatic eligibility detection for{" "}
              <strong className="text-gray-900">
                {selectedRule.benefit_type}
              </strong>
              . Confirm?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedRule(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={toggleStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RULE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl w-full max-w-xl shadow-2xl my-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Create New Eligibility Rule
            </h2>
            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rule_name"
                    className="block text-xs font-bold text-gray-500 mb-1"
                  >
                    RULE NAME
                  </label>
                  <input
                    id="rule_name"
                    name="rule_name"
                    required
                    value={formData.rule_name}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Senior Citizen Subsidy"
                  />
                </div>
                <div>
                  <label
                    htmlFor="benefit_type"
                    className="block text-xs font-bold text-gray-500 mb-1"
                  >
                    BENEFIT TYPE
                  </label>
                  <select
                    id="benefit_type"
                    name="benefit_type"
                    value={formData.benefit_type}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.keys(BADGES).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="condition_json"
                  className="block text-xs font-bold text-gray-500 mb-1"
                >
                  CONDITION EXPRESSION (JSON)
                </label>
                <textarea
                  id="condition_json"
                  name="condition_json"
                  rows={4}
                  required
                  value={formData.condition_json}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 font-mono text-xs bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="benefit_json"
                  className="block text-xs font-bold text-gray-500 mb-1"
                >
                  BENEFIT VALUE (JSON)
                </label>
                <textarea
                  id="benefit_json"
                  name="benefit_json"
                  rows={3}
                  required
                  value={formData.benefit_json}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 font-mono text-xs bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {jsonError && (
                <p className="text-red-600 text-xs font-medium bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {jsonError}
                </p>
              )}

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                <label
                  htmlFor="is_active"
                  className="flex items-center gap-2 cursor-pointer font-medium text-gray-700"
                >
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  Active initially
                </label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="priority"
                    className="text-xs font-bold text-gray-500"
                  >
                    PRIORITY LEVEL
                  </label>
                  <input
                    id="priority"
                    name="priority"
                    type="number"
                    required
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-20 border rounded-lg p-1.5 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 font-medium rounded-lg shadow-sm"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
