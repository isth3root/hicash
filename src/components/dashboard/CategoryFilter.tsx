import React from "react";
import * as Lucide from "lucide-react";
import { Checkbox } from "react-aria-components";

interface CategoryFilterProps {
  title: string;
  categories: Array<{ id: string; label: string; value: number }>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  getCategoryState: (categoryId: string) => {
    checked: boolean;
    indeterminate: boolean;
  };
  onCategoryCheckboxChange: (categoryId: string, checked: boolean) => void;
  expandedCategories: Record<string, boolean>;
  onToggleExpand: (categoryId: string) => void;
  getTransactionsByCategory: (
    categoryId: string,
    type: "income" | "cost"
  ) => any[];
  transactionCheckboxes: Record<string, boolean>;
  onTransactionCheckboxChange: (
    transactionKey: string,
    checked: boolean
  ) => void;
  color: "red" | "green";
  type: "income" | "cost";
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  title,
  categories,
  searchTerm,
  onSearchChange,
  getCategoryState,
  onCategoryCheckboxChange,
  expandedCategories,
  onToggleExpand,
  getTransactionsByCategory,
  transactionCheckboxes,
  onTransactionCheckboxChange,
  color,
  type,
}) => {
  const colorClasses = {
    red: {
      searchFocus: "focus:ring-red-500 focus:border-red-500",
      text: "text-red-600",
    },
    green: {
      searchFocus: "focus:ring-green-500 focus:border-green-500",
      text: "text-green-600",
    },
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Lucide.TrendingDown
          className={`w-5 h-5 ${colorClasses[color].text}`}
        />
        {title}
      </h3>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder={`جستجوی ${
              type === "cost" ? "هزینه‌ها" : "درآمدها"
            }...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 ${colorClasses[color].searchFocus} focus:outline-none`}
          />
          <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {categories
            .filter(
              (category) =>
                category.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((category) => {
              const catState = getCategoryState(category.id);

              return (
                <div
                  key={category.id}
                  className="bg-white p-3 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      className="group flex items-center gap-2"
                      isSelected={catState.checked}
                      isIndeterminate={catState.indeterminate}
                      onChange={(checked) =>
                        onCategoryCheckboxChange(category.id, checked)
                      }
                    >
                      <div
                        className={`
                          w-4 h-4 border rounded flex items-center justify-center
                          group-data-selected:${
                            color === "red" ? "bg-red-500" : "bg-green-500"
                          }
                          group-data-indeterminate:bg-yellow-500
                        `}
                      >
                        <span className="text-white text-xs opacity-0 group-data-selected:opacity-100 group-data-indeterminate:opacity-100">
                          {catState.indeterminate ? (
                            <div className="w-2.5 h-0.5 bg-white rounded opacity-0 group-data-indeterminate:opacity-100 transition-opacity" />
                          ) : (
                            <svg
                              className="w-3 h-3 text-white opacity-0 group-data-selected:opacity-100 transition-opacity"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </Checkbox>

                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {category.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {category.value.toLocaleString("fa-IR")} تومان
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleExpand(category.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedCategories[category.id] ? (
                        <Lucide.ChevronUp className="w-4 h-4" />
                      ) : (
                        <Lucide.ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {expandedCategories[category.id] && (
                    <div className="mt-3 ml-6 space-y-2">
                      {getTransactionsByCategory(category.id, type)
                        .filter(
                          (transaction) =>
                            transaction.category
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            transaction.items.some((item: any) =>
                              item.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                        )
                        .map((transaction, index) => {
                          const transactionKey = `${transaction.date}-${
                            transaction.category
                          }-${transaction.items
                            .map((i: any) => i.name)
                            .join(",")}`;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                            >
                              <Checkbox
                                className="group flex items-center gap-2"
                                isSelected={
                                  transactionCheckboxes[transactionKey] !==
                                  false
                                }
                                onChange={(checked) =>
                                  onTransactionCheckboxChange(
                                    transactionKey,
                                    checked
                                  )
                                }
                              >
                                <div
                                  className={`
                                    w-4 h-4 border rounded flex items-center justify-center
                                    group-data-selected:${
                                      color === "red"
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                    }
                                  `}
                                >
                                  <svg
                                    className="w-3 h-3 text-white opacity-0 group-data-selected:opacity-100 transition-opacity"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              </Checkbox>

                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">
                                  {new Date(
                                    transaction.date
                                  ).toLocaleDateString("fa-IR")}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {transaction.items
                                    .map((item: any) => item.name)
                                    .join(", ")}
                                </div>
                              </div>
                              <div
                                className={`text-sm font-semibold ${colorClasses[color].text}`}
                              >
                                {transaction.displayAmount.toLocaleString(
                                  "fa-IR"
                                )}{" "}
                                تومان
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <Lucide.List className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>
            {type === "cost" ? "دسته‌بندی هزینه‌ای" : "دسته‌بندی درآمدی"} یافت
            نشد
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
