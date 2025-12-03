import React, { useState } from "react";
import Card from "../components/ui/Card";
import * as Lucide from "lucide-react";
import type { Transaction } from "../App";
import { formatToman, fromTomanStorage } from "../utils/currency";
import { DatePicker } from "zaman";
import { ResponsivePie } from "@nivo/pie";

interface DashboardPageProps {
  transactions: Transaction[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<"past" | "future">("past");
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date()
  });
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<string | null>(null);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string | null>(null);

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (!dateRange.start || transactionDate >= dateRange.start) &&
           (!dateRange.end || transactionDate <= dateRange.end);
  });

  // Calculate statistics for filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "cost")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  // Calculate current balance (including initial balance)
  const calculateCurrentBalance = () => {
    const initialBalance = 0; // This would come from localStorage in a real implementation
    const balanceFromTransactions = transactions.reduce((acc, transaction) => {
      if (transaction.type === "income") {
        return acc + transaction.totalAmount;
      }
      return acc - transaction.totalAmount;
    }, 0);
    return initialBalance + balanceFromTransactions;
  };

  const currentBalance = calculateCurrentBalance();

  // Prepare data for pie charts - separate income and expense
  const incomeCategoryData = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((acc, transaction) => {
      const displayAmount = fromTomanStorage(transaction.totalAmount);
      const existingCategory = acc.find(item => item.id === transaction.category);
      if (existingCategory) {
        existingCategory.value += displayAmount;
      } else {
        acc.push({
          id: transaction.category,
          label: transaction.category,
          value: displayAmount
        });
      }
      return acc;
    }, [] as { id: string; label: string; value: number }[]);

  const expenseCategoryData = filteredTransactions
    .filter(t => t.type === "cost")
    .reduce((acc, transaction) => {
      const displayAmount = fromTomanStorage(transaction.totalAmount);
      const existingCategory = acc.find(item => item.id === transaction.category);
      if (existingCategory) {
        existingCategory.value += displayAmount;
      } else {
        acc.push({
          id: transaction.category,
          label: transaction.category,
          value: displayAmount
        });
      }
      return acc;
    }, [] as { id: string; label: string; value: number }[]);

  // Get transactions for a specific category
  const getTransactionsByCategory = (category: string, type: "income" | "cost") => {
    return filteredTransactions
      .filter(t => t.type === type && t.category === category)
      .map(t => ({
        ...t,
        displayAmount: fromTomanStorage(t.totalAmount)
      }));
  };

  // Calculate percentage for individual transactions within a category
  const calculateTransactionPercentages = (transactions: ReturnType<typeof getTransactionsByCategory>) => {
    if (transactions.length === 0) return transactions;

    const total = transactions.reduce((sum, t) => sum + t.displayAmount, 0);
    return transactions.map(t => ({
      ...t,
      percentage: total > 0 ? (t.displayAmount / total) * 100 : 0
    })) as Array<ReturnType<typeof getTransactionsByCategory>[number] & { percentage: number }>;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeZamanDate = (input: any): Date|null => {
    if (!input) return null;

    if (input.value instanceof Date) {
      return input.value
    }

    if (input.year && input.month && input.day) {
      return new Date(input.year, input.month - 1, input.day)
    }

    console.warn("Invalid date format", input);
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Date Picker - Redesigned */}
      <div className="mb-6">
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Lucide.Calendar className="w-5 h-5 text-blue-600" />
              بازه زمانی
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    start: new Date(today.setDate(today.getDate() - 7)),
                    end: new Date(),
                  });
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                هفته گذشته
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    start: new Date(today.getFullYear(), today.getMonth(), 1),
                    end: new Date(),
                  });
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                این ماه
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    start: new Date(today.getFullYear(), 0, 1),
                    end: new Date(),
                  });
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                امسال
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                از تاریخ
              </label>
              <div className="relative">
                <DatePicker
                  onChange={(date) => {
                    if (date) {
                      const d = normalizeZamanDate(date);
                      setDateRange((prev) => ({ ...prev, start: d }));
                    }
                  }}
                  className="w-full zaman-datepicker "
                  inputClass="w-full rounded-lg border-2 border-gray-300 bg-white px-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
                <Lucide.Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تا تاریخ
              </label>
              <div className="relative">
                <DatePicker
                  onChange={(date) => {
                    if (date) {
                      const d = normalizeZamanDate(date);
                      setDateRange((prev) => ({ ...prev, end: d }));
                    }
                  }}
                  className="w-full zaman-datepicker "
                  inputClass="w-full rounded-lg border-2 border-gray-300 bg-white px-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
                <Lucide.Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
          {dateRange.start || dateRange.end ? (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Lucide.Info className="w-4 h-4 text-blue-600" />
                <span>
                  بازه زمانی انتخاب شده:
                  <span className="font-medium">
                    {" "}
                    {dateRange.start
                      ? dateRange.start.toLocaleDateString("fa-IR")
                      : "---"}
                  </span>
                  <span className="mx-1">تا</span>
                  <span className="font-medium">
                    {" "}
                    {dateRange.end
                      ? dateRange.end.toLocaleDateString("fa-IR")
                      : "---"}
                  </span>
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <Lucide.TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">کل درآمد</p>
              <p className="text-2xl font-bold text-green-600">
                {formatToman(totalIncome)}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              این ماه
            </p>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 rounded-lg">
              <Lucide.TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">کل هزینه‌ها</p>
              <p className="text-2xl font-bold text-red-600">
                {formatToman(totalExpenses)}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              این ماه
            </p>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Lucide.Wallet className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">بالانس فعلی</p>
              <p
                className={`text-2xl font-bold ${
                  currentBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatToman(currentBalance)}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              کلی
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for past/future transactions */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "past"
                ? "bg-primary-100 text-primary-700 border border-primary-300"
                : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            تراکنش‌های گذشته
          </button>
          <button
            onClick={() => setActiveTab("future")}
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

      {/* Content below tabs - only show for past transactions */}
      {activeTab === "past" && (
        <>
          {/* Pie Charts - Reorganized layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expense Chart - Left side */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lucide.TrendingDown className="w-5 h-5 text-red-600" />
                توزیع هزینه‌ها
              </h3>
              {expenseCategoryData.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsivePie
                    data={expenseCategoryData}
                    margin={{ top: 20, right: 20, bottom: 120, left: 20 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ scheme: "reds" }}
                    borderWidth={1}
                    borderColor={{
                      from: "color",
                      modifiers: [["darker", 0.2]],
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                      from: "color",
                      modifiers: [["darker", 2]],
                    }}
                    tooltip={(datum) => {
                      const total = expenseCategoryData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      );
                      const percentage =
                        total > 0
                          ? ((datum.datum.value / total) * 100).toFixed(1)
                          : "0";
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <div className="font-semibold text-gray-800">
                            {datum.datum.label}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {datum.datum.value.toLocaleString("fa-IR")} تومان (
                            {percentage}%)
                          </div>
                        </div>
                      );
                    }}
                    onClick={(datum) => {
                      setSelectedExpenseCategory(String(datum.id));
                    }}
                    legends={[
                      {
                        anchor: "bottom",
                        direction: "row",
                        justify: false,
                        translateX: 0,
                        translateY: 96,
                        itemsSpacing: 10,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemTextColor: "#999",
                        itemDirection: "left-to-right",
                        symbolSize: 18,
                        symbolShape: "circle",
                        effects: [
                          {
                            on: "hover",
                            style: {
                              itemTextColor: "#000",
                            },
                          },
                        ],
                      },
                    ]}
                    theme={{
                      labels: {
                        text: {
                          fontSize: 14,
                          fontWeight: 600,
                        },
                      },
                      legends: {
                        text: {
                          fontSize: 12,
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lucide.PieChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>داده‌ای برای نمایش نمودار هزینه وجود ندارد</p>
                  <p className="text-sm">
                    تراکنش هزینه‌ای در بازه زمانی انتخاب شده یافت نشد
                  </p>
                </div>
              )}

              {/* Expense Category Transactions - Integrated into chart */}
              {selectedExpenseCategory && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Lucide.List className="w-4 h-4 text-red-600" />
                    تراکنش‌های دسته {selectedExpenseCategory}
                  </h4>
                  {(() => {
                    const transactions = getTransactionsByCategory(
                      selectedExpenseCategory,
                      "cost"
                    );
                    const transactionsWithPercentages =
                      calculateTransactionPercentages(transactions);

                    if (transactionsWithPercentages.length === 0) {
                      return (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          تراکنشی در این دسته‌بندی یافت نشد
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {transactionsWithPercentages.map(
                          (transaction, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <Lucide.TrendingDown className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-800">
                                    {new Date(
                                      transaction.date
                                    ).toLocaleDateString("fa-IR")}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {transaction.items.length} آیتم
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {transaction.items
                                      .map((item) => item.name)
                                      .join(", ")}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-red-600">
                                  {transaction.displayAmount.toLocaleString(
                                    "fa-IR"
                                  )}{" "}
                                  تومان
                                </div>
                                <div className="text-xs text-gray-500">
                                  {"percentage" in transaction &&
                                  typeof transaction.percentage === "number"
                                    ? transaction.percentage.toFixed(1) + "%"
                                    : "0%"}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Income Chart - Right side */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lucide.TrendingUp className="w-5 h-5 text-green-600" />
                توزیع درآمدها
              </h3>
              {incomeCategoryData.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsivePie
                    data={incomeCategoryData}
                    margin={{ top: 20, right: 20, bottom: 120, left: 20 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ scheme: "greens" }}
                    borderWidth={1}
                    borderColor={{
                      from: "color",
                      modifiers: [["darker", 0.2]],
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                      from: "color",
                      modifiers: [["darker", 2]],
                    }}
                    tooltip={(datum) => {
                      const total = incomeCategoryData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      );
                      const percentage =
                        total > 0
                          ? ((datum.datum.value / total) * 100).toFixed(1)
                          : "0";
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <div className="font-semibold text-gray-800">
                            {datum.datum.label}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {datum.datum.value.toLocaleString("fa-IR")} تومان (
                            {percentage}%)
                          </div>
                        </div>
                      );
                    }}
                    onClick={(datum) => {
                      setSelectedIncomeCategory(String(datum.id));
                    }}
                    legends={[
                      {
                        anchor: "bottom",
                        direction: "row",
                        justify: false,
                        translateX: 0,
                        translateY: 96,
                        itemsSpacing: 10,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemTextColor: "#999",
                        itemDirection: "left-to-right",
                        symbolSize: 18,
                        symbolShape: "circle",
                        effects: [
                          {
                            on: "hover",
                            style: {
                              itemTextColor: "#000",
                            },
                          },
                        ],
                      },
                    ]}
                    theme={{
                      labels: {
                        text: {
                          fontSize: 14,
                          fontWeight: 600,
                        },
                      },
                      legends: {
                        text: {
                          fontSize: 12,
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lucide.PieChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>داده‌ای برای نمایش نمودار درآمد وجود ندارد</p>
                  <p className="text-sm">
                    تراکنش درآمدی در بازه زمانی انتخاب شده یافت نشد
                  </p>
                </div>
              )}

              {/* Income Category Transactions - Integrated into chart */}
              {selectedIncomeCategory && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Lucide.List className="w-4 h-4 text-green-600" />
                    تراکنش‌های دسته {selectedIncomeCategory}
                  </h4>
                  {(() => {
                    const transactions = getTransactionsByCategory(
                      selectedIncomeCategory,
                      "income"
                    );
                    const transactionsWithPercentages =
                      calculateTransactionPercentages(transactions);

                    if (transactionsWithPercentages.length === 0) {
                      return (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          تراکنشی در این دسته‌بندی یافت نشد
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {transactionsWithPercentages.map(
                          (transaction, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Lucide.TrendingUp className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-800">
                                    {new Date(
                                      transaction.date
                                    ).toLocaleDateString("fa-IR")}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {transaction.items.length} آیتم
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {transaction.items
                                      .map((item) => item.name)
                                      .join(", ")}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-green-600">
                                  {transaction.displayAmount.toLocaleString(
                                    "fa-IR"
                                  )}{" "}
                                  تومان
                                </div>
                                <div className="text-xs text-gray-500">
                                  {"percentage" in transaction &&
                                  typeof transaction.percentage === "number"
                                    ? transaction.percentage.toFixed(1) + "%"
                                    : "0%"}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-8">
            <Card title="فعالیت‌های اخیر">
              <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Lucide.Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>تراکنشی در این بازه زمانی یافت نشد</p>
                    <p className="text-sm">
                      تراکنش‌های شما در این بازه زمانی نمایش داده خواهند شد
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions
                      .slice(0, 5)
                      .map((transaction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                transaction.type === "income"
                                  ? "bg-green-100"
                                  : "bg-red-100"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <Lucide.TrendingUp className="w-5 h-5 text-green-600" />
                              ) : (
                                <Lucide.TrendingDown className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {transaction.category}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(transaction.date).toLocaleDateString(
                                  "fa-IR"
                                )}
                              </div>
                              <div className="text-xs text-gray-400">
                                {transaction.items
                                  .map((item) => item.name)
                                  .join(", ")}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`font-semibold ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatToman(transaction.totalAmount)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Future transactions content - show when future tab is active */}
      {activeTab === "future" && (
        <div className="text-center py-12">
          <Lucide.Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            تراکنش‌های آینده
          </h3>
          <p className="text-gray-500">
            این بخش برای نمایش تراکنش‌های برنامه‌ریزی شده آینده است
          </p>
          <p className="text-sm text-gray-400 mt-1">
            تراکنش‌های آینده شما در اینجا نمایش داده خواهند شد
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;