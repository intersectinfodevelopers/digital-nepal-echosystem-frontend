"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import rulesData from "../../../../data/eligibility-rules.json";

/* types */
type Rule = {
  id: string;
  rule_name: string;
  benefit_type: string;
  condition_expression: Record<string, unknown>;
  benefit_value: Record<string, unknown>;
  priority: number;
  is_active: boolean;
};

/* storage key */
const STORAGE_KEY = "eligibility_rules_state";

// Helper for benefit badges
const getBadgeStyles = (type: string) => {
  switch (type) {
    case "UNEMPLOYMENT_ID": return "bg-amber-100 text-amber-800 border-amber-200";
    case "DISABILITY_ID": return "bg-blue-100 text-blue-800 border-blue-200";
    case "SENIOR_CITIZEN_ALLOWANCE":
    case "SENIOR_CITIZEN": return "bg-green-100 text-green-800 border-green-200";
    case "SINGLE_WOMAN": return "bg-pink-100 text-pink-800 border-pink-200";
    case "FOOD_SUBSIDY": return "bg-orange-100 text-orange-800 border-orange-200";
    case "HEALTH_INSURANCE": return "bg-teal-100 text-teal-800 border-teal-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Formats expressions into human-readable sentences
const getConditionSummary = (expr: Record<string, any>): string => {
  if (!expr || !expr.field) return "No conditions";
  
  const formatField = (f: string) => f.replace(/\./g, " ");

  const mainField = formatField(expr.field);
  let summary = "";

  if (expr.field === "age" && expr.operator === ">=") {
    summary = `age is ${expr.value} or older`;
  } else if (expr.operator === "=") {
    summary = `${mainField} is ${expr.value}`;
  } else if (expr.operator === ">=") {
    summary = `${mainField} is greater than or equal to ${expr.value}`;
  } else {
    summary = `${mainField} ${expr.operator} ${expr.value}`;
  }

  if (expr.and) {
    const andField = formatField(expr.and.field);
    let andSummary = "";
    
    if (expr.and.field === "age" && expr.and.operator === ">=") {
      andSummary = `age is ${expr.and.value} or older`;
    } else if (expr.and.operator === "=") {
      andSummary = `${andField} is ${expr.and.value}`;
    } else {
      andSummary = `${andField} ${expr.and.operator} ${expr.and.value}`;
    }
    
    summary += ` AND ${andSummary}`;
  }

  return summary.charAt(0).toUpperCase() + summary.slice(1);
};

export default function Page() {
  // Sort ascending: lower number = higher priority
  const [data, setData] = useState<Rule[]>(() =>
    [...rulesData].sort((a, b) => a.priority - b.priority) as Rule[]
  );
  const [hydrated, setHydrated] = useState(false);

  // Modals state
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    rule_name: "",
    benefit_type: "UNEMPLOYMENT_ID",
    condition_expression: '{\n  "field": "age",\n  "operator": ">=",\n  "value": 18\n}',
    benefit_value: '{\n  "card_type": "STANDARD"\n}',
    priority: "40",
    is_active: true,
  });

  /* load localStorage after hydration */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Rule[];
        setData(parsed.sort((a, b) => a.priority - b.priority));
      } catch (e) {
        console.error("Failed to parse stored rules", e);
      }
    }
    setHydrated(true);
  }, []);

  /* persist changes */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  /* toggle status */
  const handleToggleClick = (rule: Rule) => {
    setSelectedRule(rule);
    setShowToggleModal(true);
  };

  const confirmToggle = () => {
    if (!selectedRule) return;
    setData((prev) =>
      prev.map((r) =>
        r.id === selectedRule.id ? { ...r, is_active: !r.is_active } : r
      )
    );
    setShowToggleModal(false);
    setSelectedRule(null);
  };

  /* priority moving (swaps priorities between items) */
  const moveUp = (index: number) => {
    if (index === 0) return;
    setData((prev) => {
      const arr = [...prev];
      const tempPriority = arr[index - 1].priority;
      arr[index - 1].priority = arr[index].priority;
      arr[index].priority = tempPriority;
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    setData((prev) => {
      if (index === prev.length - 1) return prev;
      const arr = [...prev];
      const tempPriority = arr[index].priority;
      arr[index].priority = arr[index + 1].priority;
      arr[index + 1].priority = tempPriority;
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  /* Create Rule Submit */
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRule: Rule = {
        id: `rule-${Date.now()}`,
        rule_name: formData.rule_name,
        benefit_type: formData.benefit_type,
        condition_expression: JSON.parse(formData.condition_expression),
        benefit_value: JSON.parse(formData.benefit_value),
        priority: Number(formData.priority),
        is_active: formData.is_active,
      };

      setData((prev) => [...prev, newRule].sort((a, b) => a.priority - b.priority));
      setShowCreateModal(false);
      // Reset form
      setFormData({
        rule_name: "",
        benefit_type: "UNEMPLOYMENT_ID",
        condition_expression: '{\n  "field": "age",\n  "operator": ">=",\n  "value": 18\n}',
        benefit_value: '{\n  "card_type": "STANDARD"\n}',
        priority: "40",
        is_active: true,
      });
    } catch (err) {
      alert("Invalid JSON formatting in Condition Expression or Benefit Value!");
    }
  };

  if (!hydrated) {
    return <div className="p-6 bg-gray-50 min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Eligibility Rules</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          + Create Rule
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-x-auto border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700 text-sm">Rule Name</th>
              <th className="p-3 text-left font-semibold text-gray-700 text-sm">Benefit Type</th>
              <th className="p-3 text-left font-semibold text-gray-700 text-sm">Condition Summary</th>
              <th className="p-3 text-left font-semibold text-gray-700 text-sm">Priority</th>
              <th className="p-3 text-left font-semibold text-gray-700 text-sm">Status</th>
              <th className="p-3 text-left font-semibold text-gray-700 text-sm">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((rule, index) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-sm">{rule.rule_name}</td>
                <td className="p-3 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyles(rule.benefit_type)}`}>
                    {rule.benefit_type}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600 max-w-xs md:max-w-sm">
                  {getConditionSummary(rule.condition_expression)}
                </td>
                <td className="p-3 text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{rule.priority}</span>
                    <div className="flex flex-col text-gray-500">
                      <button onClick={() => moveUp(index)} className="hover:text-gray-900 transition-colors">▲</button>
                      <button onClick={() => moveDown(index)} className="hover:text-gray-900 transition-colors">▼</button>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">
                  <button
                    onClick={() => handleToggleClick(rule)}
                    className={`px-3 py-1 rounded-full text-white text-xs font-medium transition-colors ${
                      rule.is_active ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"
                    }`}
                  >
                    {rule.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3 text-sm">
                  <Link href={`/central/eligibility-rules/${rule.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CONFIRM TOGGLE STATUS MODAL */}
      {showToggleModal && selectedRule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[440px] shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold mb-2">Confirm Action</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {selectedRule.is_active
                ? `Disabling this rule will stop automatic eligibility detection for ${selectedRule.benefit_type}. Confirm?`
                : `Enabling this rule will allow automatic eligibility detection for ${selectedRule.benefit_type}. Confirm?`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowToggleModal(false); setSelectedRule(null); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggle}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-medium rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RULE MODAL & FORM */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl border border-gray-100 my-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Create Eligibility Rule</h2>
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label 
                  htmlFor="rule_name" 
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  Rule Name
                </label>
                <input
                  id="rule_name"
                  type="text"
                  required
                  value={formData.rule_name}
                  onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., single_woman_allowance"
                />
              </div>

              <div>
                <label 
                  htmlFor="benefit_type" 
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  Benefit Type
                </label>
                <select
                  id="benefit_type"
                  value={formData.benefit_type}
                  onChange={(e) => setFormData({ ...formData, benefit_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="UNEMPLOYMENT_ID">UNEMPLOYMENT_ID</option>
                  <option value="DISABILITY_ID">DISABILITY_ID</option>
                  <option value="SENIOR_CITIZEN">SENIOR_CITIZEN</option>
                  <option value="SINGLE_WOMAN">SINGLE_WOMAN</option>
                  <option value="FOOD_SUBSIDY">FOOD_SUBSIDY</option>
                  <option value="HEALTH_INSURANCE">HEALTH_INSURANCE</option>
                </select>
              </div>

              <div>
                <label 
                  htmlFor="condition_expression" 
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  Condition Expression (JSON)
                </label>
                <textarea
                  id="condition_expression"
                  required
                  rows={4}
                  placeholder='{\n  "field": "age",\n  "operator": ">=",\n  "value": 18\n}'
                  value={formData.condition_expression}
                  onChange={(e) => setFormData({ ...formData, condition_expression: e.target.value })}
                  className="w-full border border-gray-300 font-mono rounded-lg p-2 text-xs bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label 
                  htmlFor="benefit_value" 
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                >
                  Benefit Value (JSON)
                </label>
                <textarea
                  id="benefit_value"
                  required
                  rows={3}
                  placeholder='{\n  "card_type": "STANDARD"\n}'
                  value={formData.benefit_value}
                  onChange={(e) => setFormData({ ...formData, benefit_value: e.target.value })}
                  className="w-full border border-gray-300 font-mono rounded-lg p-2 text-xs bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    htmlFor="priority" 
                    className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1"
                  >
                    Priority Number
                  </label>
                  <input
                    id="priority"
                    type="number"
                    required
                    placeholder="e.g., 40"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    Is Active Initially
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-medium rounded-lg"
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