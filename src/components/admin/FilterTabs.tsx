"use client";

interface FilterTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  return (
    <div className="border-b border-border flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
            activeTab === tab
              ? "text-primary border-b-2 border-primary font-medium"
              : "text-muted hover:text-body"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
