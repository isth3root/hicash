import React, { useState } from "react";
import Card from "../components/ui/Card";
import * as Lucide from "lucide-react";
import type { Transaction } from "../App";
import { formatToman, fromTomanStorage } from "../utils/currency";
import { DatePicker } from "zaman";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { Checkbox } from "react-aria-components";

interface DashboardPageProps {
  transactions: Transaction[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<"past" | "future">("past");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date(),
  });
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<
    string | null
  >(null);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<
    string | null
  >(null);
  const [expenseSearchTerm, setExpenseSearchTerm] = useState("");
  const [incomeSearchTerm, setIncomeSearchTerm] = useState("");
  const [expenseCheckboxes, ] = useState<
    Record<string, boolean>
  >({});
  const [incomeCheckboxes, ] = useState<
    Record<string, boolean>
  >({});
  const [expandedExpenseCategories, setExpandedExpenseCategories] = useState<
    Record<string, boolean>
  >({});
  const [expandedIncomeCategories, setExpandedIncomeCategories] = useState<
    Record<string, boolean>
  >({});
  const [expenseTransactionCheckboxes, setExpenseTransactionCheckboxes] =
    useState<Record<string, boolean>>({});
  const [incomeTransactionCheckboxes, setIncomeTransactionCheckboxes] =
    useState<Record<string, boolean>>({});

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      (!dateRange.start || transactionDate >= dateRange.start) &&
      (!dateRange.end || transactionDate <= dateRange.end)
    );
  });

  // Calculate statistics for filtered transactions
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "cost")
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
    .filter((t) => t.type === "income")
    .reduce((acc, transaction) => {
      const displayAmount = fromTomanStorage(transaction.totalAmount);
      const existingCategory = acc.find(
        (item) => item.id === transaction.category
      );
      if (existingCategory) {
        existingCategory.value += displayAmount;
      } else {
        acc.push({
          id: transaction.category,
          label: transaction.category,
          value: displayAmount,
        });
      }
      return acc;
    }, [] as { id: string; label: string; value: number }[]);

  const expenseCategoryData = filteredTransactions
    .filter((t) => t.type === "cost")
    .reduce((acc, transaction) => {
      const displayAmount = fromTomanStorage(transaction.totalAmount);
      const existingCategory = acc.find(
        (item) => item.id === transaction.category
      );
      if (existingCategory) {
        existingCategory.value += displayAmount;
      } else {
        acc.push({
          id: transaction.category,
          label: transaction.category,
          value: displayAmount,
        });
      }
      return acc;
    }, [] as { id: string; label: string; value: number }[]);

  // Get transactions for a specific category
  const getTransactionsByCategory = (
    category: string,
    type: "income" | "cost"
  ) => {
    return filteredTransactions
      .filter((t) => t.type === type && t.category === category)
      .map((t) => ({
        ...t,
        displayAmount: fromTomanStorage(t.totalAmount),
      }));
  };

  // Calculate percentage for individual transactions within a category
  const calculateTransactionPercentages = (
    transactions: ReturnType<typeof getTransactionsByCategory>
  ) => {
    if (transactions.length === 0) return transactions;

    const total = transactions.reduce((sum, t) => sum + t.displayAmount, 0);
    return transactions.map((t) => ({
      ...t,
      percentage: total > 0 ? (t.displayAmount / total) * 100 : 0,
    })) as Array<
      ReturnType<typeof getTransactionsByCategory>[number] & {
        percentage: number;
      }
    >;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeZamanDate = (input: any): Date | null => {
    if (!input) return null;

    if (input.value instanceof Date) {
      return input.value;
    }

    if (input.year && input.month && input.day) {
      return new Date(input.year, input.month - 1, input.day);
    }

    console.warn("Invalid date format", input);
    return null;
  };

  // Prepare data for line chart - expenses and balance per day with missing data for future days
  const prepareLineChartData = () => {
    if (!dateRange.start || !dateRange.end) return { data: [], xAxisDays: [] };

    // Generate all days in the selected interval
    const xAxisDays: string[] = [];
    const currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    while (currentDate <= endDate) {
      xAxisDays.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group transactions by day and calculate expenses and balance
    const dailyData: Record<string, { expenses: number; balance: number }> = {};

    // Initialize with initial balance (assuming 0 for simplicity)
    let runningBalance = 0;

    // Process all transactions to calculate daily balance
    const allTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    allTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const dateKey = transactionDate.toISOString().split("T")[0];

      // Only include transactions within the selected date range
      if (
        transactionDate >= dateRange.start! &&
        transactionDate <= dateRange.end!
      ) {
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { expenses: 0, balance: runningBalance };
        }

        // Check if this transaction's category is checked in the checkboxes
        const isExpenseChecked =
          expenseCheckboxes[transaction.category] !== false;
        const isIncomeChecked =
          incomeCheckboxes[transaction.category] !== false;

        // Generate unique key for transaction checkbox state
        const transactionKey = `${transaction.date}-${
          transaction.category
        }-${transaction.items.map((i) => i.name).join(",")}`;

        // Check if individual transaction is checked
        const isExpenseTransactionChecked =
          expenseTransactionCheckboxes[transactionKey] !== false;
        const isIncomeTransactionChecked =
          incomeTransactionCheckboxes[transactionKey] !== false;

        if (
          transaction.type === "cost" &&
          isExpenseChecked &&
          isExpenseTransactionChecked
        ) {
          dailyData[dateKey].expenses += transaction.totalAmount;
          runningBalance -= transaction.totalAmount;
        } else if (
          transaction.type === "income" &&
          isIncomeChecked &&
          isIncomeTransactionChecked
        ) {
          runningBalance += transaction.totalAmount;
        }

        dailyData[dateKey].balance = runningBalance;
      }
    });

    // Fill in missing days with previous balance
    let lastBalance: number | null = null;
    xAxisDays.forEach((day) => {
      if (!dailyData[day]) {
        dailyData[day] = { expenses: 0, balance: lastBalance ?? 0 };
      } else {
        lastBalance = dailyData[day].balance;
      }
    });

    const lineData = [
      {
        id: "هزینه‌ها",
        data: xAxisDays.map((day) => {
          const date = new Date(day);
          const jalaliDay = date.toLocaleDateString("fa-IR", {
            day: "numeric",
          });
          const jalaliFullDate = date.toLocaleDateString("fa-IR", {
            month: "short",
            day: "numeric",
          });

          const expenses = dailyData[day]?.expenses || 0;

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dayDate = new Date(day);
          dayDate.setHours(0, 0, 0, 0);

          const isFutureDay = dayDate > today;

          return {
            x: jalaliFullDate,
            y: isFutureDay ? null : fromTomanStorage(expenses),
            value: expenses,
            dayOnly: jalaliDay,
          };
        }),
      },
      {
        id: "بالانس",
        data: xAxisDays.map((day) => {
          const date = new Date(day);
          const jalaliDay = date.toLocaleDateString("fa-IR", {
            day: "numeric",
          });
          const jalaliFullDate = date.toLocaleDateString("fa-IR", {
            month: "short",
            day: "numeric",
          });

          const balance = dailyData[day]?.balance || 0;

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dayDate = new Date(day);
          dayDate.setHours(0, 0, 0, 0);

          const isFutureDay = dayDate > today;

          return {
            x: jalaliFullDate,
            y: isFutureDay ? null : fromTomanStorage(balance),
            value: balance,
            dayOnly: jalaliDay,
          };
        }),
      },
    ];

    const jalaliXAxisDays = xAxisDays.map((day) => {
      const date = new Date(day);
      return date.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    });

    return { data: lineData, xAxisDays: jalaliXAxisDays };
  };

  const getExpenseCategoryState = (categoryId: string) => {
    const txs = getTransactionsByCategory(categoryId, "cost");
    if (txs.length === 0) return { checked: false, indeterminate: false };

    const values = txs.map((t) => {
      const key = `${t.date}-${t.category}-${t.items
        .map((i) => i.name)
        .join(",")}`;
      return expenseTransactionCheckboxes[key] !== false;
    });

    const checkedCount = values.filter(Boolean).length;

    return {
      checked: checkedCount === values.length,
      indeterminate: checkedCount > 0 && checkedCount < values.length,
    };
  };

  const getIncomeCategoryState = (categoryId: string) => {
    const txs = getTransactionsByCategory(categoryId, "income");
    if (txs.length === 0) return { checked: false, indeterminate: false };

    const values = txs.map((t) => {
      const key = `${t.date}-${t.category}-${t.items
        .map((i) => i.name)
        .join(",")}`;
      return incomeTransactionCheckboxes[key] !== false;
    });

    const checkedCount = values.filter(Boolean).length;

    return {
      checked: checkedCount === values.length,
      indeterminate: checkedCount > 0 && checkedCount < values.length,
    };
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

          <div className="mt-8">
            <Card title="روند هزینه‌ها و بالانس">
              <div className="h-[400px]">
                {(() => {
                  const { data, xAxisDays } = prepareLineChartData();

                  if (xAxisDays.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <Lucide.TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>داده‌ای برای نمایش نمودار روند وجود ندارد</p>
                        <p className="text-sm">
                          لطفا یک بازه زمانی معتبر انتخاب کنید
                        </p>
                      </div>
                    );
                  }

                  return (
                    <ResponsiveLine
                      data={data}
                      colors={({ id }) =>
                        id === "هزینه‌ها" ? "#8B5CF6" : "#10B981"
                      }
                      theme={{
                        text: {
                          fontFamily: "AradVF",
                          fontSize: 14,
                          fill: "#374151",
                        },
                        axis: {
                          legend: {
                            text: {
                              fontFamily: "AradVF",
                              fontSize: 15,
                              fill: "#111827",
                            },
                          },
                        },
                        legends: {
                          text: {
                            fontFamily: "AradVF",
                            fontSize: 12,
                          },
                        },
                        tooltip: {
                          container: {
                            fontFamily: "AradVF",
                            fontSize: 12,
                          },
                        },
                      }}
                      margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                      xScale={{ type: "point" }}
                      yScale={{
                        type: "linear",
                        min: "auto",
                        max: "auto",
                        stacked: false,
                        reverse: false,
                      }}
                      yFormat=" >-.0f"
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: "تاریخ",
                        legendOffset: 40,
                        legendPosition: "middle",
                        format: (value) => value, // Use the Jalali date as-is
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "قیمت (تومان)",
                        legendOffset: -50,
                        legendPosition: "middle",
                        format: (value) => value.toLocaleString("fa-IR"),
                      }}
                      pointSize={8}
                      pointColor={{ theme: "background" }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: "serieColor" }}
                      pointLabelYOffset={-12}
                      useMesh={true}
                      enableArea={true}
                      areaOpacity={0.3}
                      areaBaselineValue={0}
                      enableSlices="x"
                      enableGridX={false}
                      enableGridY={true}
                      curve="monotoneX"
                      lineWidth={3}
                      areaBlendMode="multiply"
                      enableCrosshair={true}
                      crosshairType="cross"
                      enablePointLabel={false}
                      sliceTooltip={({ slice }) => {
                        // The x value is already a Jalali date string, use it directly
                        const xValue = slice.points[0].data.x;

                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <div className="font-semibold text-gray-800">
                              {xValue}
                            </div>
                            {slice.points.map((point) => (
                              <div
                                key={point.id}
                                className="text-sm text-gray-600 mt-1 flex justify-between"
                              >
                                <span>{point.seriesId}:</span>
                                <span>
                                  {point.data.y !== null
                                    ? Math.round(point.data.y).toLocaleString(
                                        "fa-IR"
                                      )
                                    : "بدون داده"}{" "}
                                  تومان
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                  );
                })()}
              </div>
            </Card>

            {/* Expense Categories Section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lucide.TrendingDown className="w-5 h-5 text-red-600" />
                دسته‌بندی هزینه‌ها
              </h3>

              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="جستجوی هزینه‌ها..."
                    value={expenseSearchTerm}
                    onChange={(e) => setExpenseSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                  />
                  <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              {expenseCategoryData.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {expenseCategoryData
                    .filter(
                      (category) =>
                        category.id
                          .toLowerCase()
                          .includes(expenseSearchTerm.toLowerCase()) ||
                        category.label
                          .toLowerCase()
                          .includes(expenseSearchTerm.toLowerCase())
                    )
                    .map((category) => (
                      <div
                        key={category.id}
                        className="bg-white p-3 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          {(() => {
                            const cat = getExpenseCategoryState(category.id);

                            return (
                              <Checkbox
                                className="group flex items-center gap-2"
                                isSelected={cat.checked}
                                isIndeterminate={cat.indeterminate}
                                onChange={(checked) => {
                                  const txs = getTransactionsByCategory(
                                    category.id,
                                    "cost"
                                  );

                                  setExpenseTransactionCheckboxes((prev) => {
                                    const next = { ...prev };
                                    txs.forEach((t) => {
                                      const key = `${t.date}-${
                                        t.category
                                      }-${t.items
                                        .map((i) => i.name)
                                        .join(",")}`;
                                      next[key] = checked;
                                    });
                                    return next;
                                  });
                                }}
                              >
                                <div
                                  className="
                                    w-4 h-4 border rounded flex items-center justify-center
                                    group-data-selected:bg-red-500
                                    group-data-indeterminate:bg-yellow-500
                                  "
                                >
                                  <span
                                    className="
                                      text-white text-xs opacity-0
                                      group-data-selected:opacity-100
                                      group-data-indeterminate:opacity-100
                                    "
                                  >
                                    {cat.indeterminate ? (
                                      <div
                                        className="
    w-2.5 h-0.5 bg-white rounded
    opacity-0 group-data-indeterminate:opacity-100
    transition-opacity
  "
                                      />
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
                            );
                          })()}

                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {category.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.value.toLocaleString("fa-IR")} تومان
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setExpandedExpenseCategories((prev) => ({
                                ...prev,
                                [category.id]: !prev[category.id],
                              }));
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedExpenseCategories[category.id] ? (
                              <Lucide.ChevronUp className="w-4 h-4" />
                            ) : (
                              <Lucide.ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {expandedExpenseCategories[category.id] && (
                          <div className="mt-3 ml-6 space-y-2">
                            {getTransactionsByCategory(category.id, "cost")
                              .filter(
                                (transaction) =>
                                  transaction.category
                                    .toLowerCase()
                                    .includes(
                                      expenseSearchTerm.toLowerCase()
                                    ) ||
                                  transaction.items.some((item) =>
                                    item.name
                                      .toLowerCase()
                                      .includes(expenseSearchTerm.toLowerCase())
                                  )
                              )
                              .map((transaction, index) => {
                                const transactionKey = `${transaction.date}-${
                                  transaction.category
                                }-${transaction.items
                                  .map((i) => i.name)
                                  .join(",")}`;
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                  >
                                    <Checkbox
                                      className="group flex items-center gap-2"
                                      isSelected={
                                        expenseTransactionCheckboxes[
                                          transactionKey
                                        ] !== false
                                      }
                                      onChange={(checked) => {
                                        setExpenseTransactionCheckboxes(
                                          (prev) => {
                                            const next = { ...prev };
                                            next[transactionKey] = checked;
                                            return next;
                                          }
                                        );
                                      }}
                                    >
                                      <div
                                        className="
                                          w-4 h-4 border rounded flex items-center justify-center
                                          group-data-selected:bg-red-500
                                          group-data-indeterminate:bg-yellow-500
                                        "
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
                                          .map((item) => item.name)
                                          .join(", ")}
                                      </div>
                                    </div>
                                    <div className="text-sm font-semibold text-red-600">
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
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Lucide.List className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>دسته‌بندی هزینه‌ای یافت نشد</p>
                </div>
              )}
            </div>

            {/* Income Categories Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lucide.TrendingUp className="w-5 h-5 text-green-600" />
                دسته‌بندی درآمدها
              </h3>

              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="جستجوی درآمدها..."
                    value={incomeSearchTerm}
                    onChange={(e) => setIncomeSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                  />
                  <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              {incomeCategoryData.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {incomeCategoryData
                    .filter(
                      (category) =>
                        category.id
                          .toLowerCase()
                          .includes(incomeSearchTerm.toLowerCase()) ||
                        category.label
                          .toLowerCase()
                          .includes(incomeSearchTerm.toLowerCase())
                    )
                    .map((category) => (
                      <div
                        key={category.id}
                        className="bg-white p-3 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          {(() => {
                            const cat = getIncomeCategoryState(category.id);

                            return (
                              <Checkbox
                                className="group flex items-center gap-2"
                                isSelected={cat.checked}
                                isIndeterminate={cat.indeterminate}
                                onChange={(checked) => {
                                  const txs = getTransactionsByCategory(
                                    category.id,
                                    "income"
                                  );

                                  setIncomeTransactionCheckboxes((prev) => {
                                    const next = { ...prev };
                                    txs.forEach((t) => {
                                      const key = `${t.date}-${
                                        t.category
                                      }-${t.items
                                        .map((i) => i.name)
                                        .join(",")}`;
                                      next[key] = checked;
                                    });
                                    return next;
                                  });
                                }}
                              >
                                <div
                                  className="
                                    w-4 h-4 border rounded flex items-center justify-center
                                    group-data-selected:bg-green-500
                                    group-data-indeterminate:bg-yellow-500
                                  "
                                >
                                  <span
                                    className="
                                      text-white text-xs opacity-0
                                      group-data-selected:opacity-100
                                      group-data-indeterminate:opacity-100
                                    "
                                  >
                                    {cat.indeterminate ? (
                                      <div
                                        className="
    w-2.5 h-0.5 bg-white rounded
    opacity-0 group-data-indeterminate:opacity-100
    transition-opacity
  "
                                      />
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
                            );
                          })()}

                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {category.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.value.toLocaleString("fa-IR")} تومان
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setExpandedIncomeCategories((prev) => ({
                                ...prev,
                                [category.id]: !prev[category.id],
                              }));
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedIncomeCategories[category.id] ? (
                              <Lucide.ChevronUp className="w-4 h-4" />
                            ) : (
                              <Lucide.ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {expandedIncomeCategories[category.id] && (
                          <div className="mt-3 ml-6 space-y-2">
                            {getTransactionsByCategory(category.id, "income")
                              .filter(
                                (transaction) =>
                                  transaction.category
                                    .toLowerCase()
                                    .includes(incomeSearchTerm.toLowerCase()) ||
                                  transaction.items.some((item) =>
                                    item.name
                                      .toLowerCase()
                                      .includes(incomeSearchTerm.toLowerCase())
                                  )
                              )
                              .map((transaction, index) => {
                                const transactionKey = `${transaction.date}-${
                                  transaction.category
                                }-${transaction.items
                                  .map((i) => i.name)
                                  .join(",")}`;
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                  >
                                    <Checkbox
                                      className="group flex items-center gap-2"
                                      isSelected={
                                        incomeTransactionCheckboxes[
                                          transactionKey
                                        ] !== false
                                      }
                                      onChange={(checked) => {
                                        setIncomeTransactionCheckboxes(
                                          (prev) => {
                                            const next = { ...prev };
                                            next[transactionKey] = checked;
                                            return next;
                                          }
                                        );
                                      }}
                                    >
                                      <div
                                        className="
                                          w-4 h-4 border rounded flex items-center justify-center
                                          group-data-selected:bg-green-500
                                          group-data-indeterminate:bg-yellow-500
                                        "
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
                                          .map((item) => item.name)
                                          .join(", ")}
                                      </div>
                                    </div>
                                    <div className="text-sm font-semibold text-green-600">
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
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Lucide.List className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>دسته‌بندی درآمدی یافت نشد</p>
                </div>
              )}
            </div>
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
