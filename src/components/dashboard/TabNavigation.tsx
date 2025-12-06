import React from "react";

interface TabNavigationProps {
  activeTab: "past" | "future";
  onTabChange: (tab: "past" | "future") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <button
          onClick={() => onTabChange("past")}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === "past"
              ? "bg-primary-100 text-primary-700 border border-primary-300"
              : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          تراکنش‌های گذشته
        </button>
        <button
          onClick={() => onTabChange("future")}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === "future"
              ? "bg-primary-100 text-primary-700 border border-primary-300"
              : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          تراکنش‌های آینده
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
