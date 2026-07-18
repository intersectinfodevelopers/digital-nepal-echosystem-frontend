"use client";

import { useState, type ReactNode } from "react";

type Tab = {
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: number;
};

export function Tabs({
  tabs,
  defaultTab = 0,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="w-full">
      {/* Tab List */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
        {tabs.map((tab, index) => {
          const active = activeTab === index;

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`
                whitespace-nowrap
                border-b-2
                px-5
                py-3
                text-sm
                font-semibold
                transition-all
                focus:outline-none
                ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}