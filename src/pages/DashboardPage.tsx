import React, { useState } from "react";
import DateRangePicker from "../components/dashboard/DateRangePicker";
import StatsOverview from "../components/dashboard/StatsOverview";
import TabNavigation from "../components/dashboard/TabNavigation";
import PieChartComponent from "../components/dashboard/PieChartComponent";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import LineChartComponent from "../components/dashboard/LineChartComponent";
import CategoryFilter from "../components/dashboard/CategoryFilter";
import FutureTransactionsPlaceholder from "../components/dashboard/FutureTransactionsPlaceholder";
import * as Lucide from "lucide-react";
import type { Transaction } from "../App";
import { fromTomanStorage } from "../utils/currency";

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
  const [period, setPeriod] = useState<'month' | 'week' | 'year'>('month');
  const [manualBalance, setManualBalance] = useState<number | null>(null);
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<
    string | null
  >(null);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<
    string | null
  >(null);
  const [expenseSearchTerm, setExpenseSearchTerm] = useState("");
  const [incomeSearchTerm, setIncomeSearchTerm] = useState("");
  const [expenseCheckboxes] = useState<Record<string, boolean>>({});
  const [incomeCheckboxes] = useState<Record<string, boolean>>({});
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

  const getPeriodStart = (selectedPeriod: 'month' | 'week' | 'year') => {
    const now = new Date();
    const start = new Date(now);
    if (selectedPeriod === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      start.setDate(now.getDate() - 30);
    } else {
      start.setFullYear(now.getFullYear() - 1);
    }
    return start;
  };

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      (!dateRange.start || transactionDate >= dateRange.start) &&
      (!dateRange.end || transactionDate <= dateRange.end)
    );
  });

  // Filter transactions for stats based on period
  const periodStart = getPeriodStart(period);
  const statsTransactions = transactions.filter((t) => new Date(t.date) >= periodStart);

  // Calculate statistics for stats transactions
  const totalIncome = statsTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalExpenses = statsTransactions
    .filter((t) => t.type === "cost")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  // Calculate current balance
  const calculateCurrentBalance = () => {
    const initialBalance = 0;
    const balanceFromTransactions = transactions.reduce((acc, transaction) => {
      if (transaction.type === "income") {
        return acc + transaction.totalAmount;
      }
      return acc - transaction.totalAmount;
    }, 0);
    return initialBalance + balanceFromTransactions;
  };

  const currentBalance = calculateCurrentBalance();
  const displayBalance = manualBalance !== null ? manualBalance : currentBalance;

  // Prepare data for pie charts
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeZamanDate = (input: any): Date | null => {
    if (!input) return null;
    if (input.value instanceof Date) return input.value;
    if (input.year && input.month && input.day) {
      return new Date(input.year, input.month - 1, input.day);
    }
    console.warn("Invalid date format", input);
    return null;
  };

  // Prepare data for line chart
  const prepareLineChartData = () => {
    if (!dateRange.start || !dateRange.end) return { data: [], xAxisDays: [] };

    const xAxisDays: string[] = [];
    const currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    while (currentDate <= endDate) {
      xAxisDays.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const dailyData: Record<string, { expenses: number; balance: number }> = {};
    let runningBalance = 0;

    const allTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    allTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const dateKey = transactionDate.toISOString().split("T")[0];

      if (
        transactionDate >= dateRange.start! &&
        transactionDate <= dateRange.end!
      ) {
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { expenses: 0, balance: runningBalance };
        }

        const isExpenseChecked =
          expenseCheckboxes[transaction.category] !== false;
        const isIncomeChecked =
          incomeCheckboxes[transaction.category] !== false;
        const transactionKey = `${transaction.date}-${
          transaction.category
        }-${transaction.items.map((i) => i.name).join(",")}`;
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
            dayOnly: date.toLocaleDateString("fa-IR", { day: "numeric" }),
          };
        }),
      },
      {
        id: "بالانس",
        data: xAxisDays.map((day) => {
          const date = new Date(day);
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
            dayOnly: date.toLocaleDateString("fa-IR", { day: "numeric" }),
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

  const handleExpenseCategoryCheckboxChange = (
    categoryId: string,
    checked: boolean
  ) => {
    const txs = getTransactionsByCategory(categoryId, "cost");
    setExpenseTransactionCheckboxes((prev) => {
      const next = { ...prev };
      txs.forEach((t) => {
        const key = `${t.date}-${t.category}-${t.items
          .map((i) => i.name)
          .join(",")}`;
        next[key] = checked;
      });
      return next;
    });
  };

  const handleIncomeCategoryCheckboxChange = (
    categoryId: string,
    checked: boolean
  ) => {
    const txs = getTransactionsByCategory(categoryId, "income");
    setIncomeTransactionCheckboxes((prev) => {
      const next = { ...prev };
      txs.forEach((t) => {
        const key = `${t.date}-${t.category}-${t.items
          .map((i) => i.name)
          .join(",")}`;
        next[key] = checked;
      });
      return next;
    });
  };

  const handleToggleExpand = (
    categoryId: string,
    setExpandedState: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >
  ) => {
    setExpandedState((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const lineChartData = prepareLineChartData();

  return (
    <div className="space-y-8">
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        normalizeZamanDate={normalizeZamanDate}
      />

      <StatsOverview
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        currentBalance={displayBalance}
        period={period}
        onPeriodChange={setPeriod}
        onBalanceChange={setManualBalance}
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "past" && (
        <>
          {/* Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PieChartComponent
              title="توزیع هزینه‌ها"
              data={expenseCategoryData}
              colorScheme="reds"
              icon={<Lucide.TrendingDown className="w-5 h-5 text-red-600" />}
              onCategoryClick={setSelectedExpenseCategory}
              selectedCategory={selectedExpenseCategory}
              getTransactionsByCategory={getTransactionsByCategory}
              transactionType="cost"
            />

            <PieChartComponent
              title="توزیع درآمدها"
              data={incomeCategoryData}
              colorScheme="greens"
              icon={<Lucide.TrendingUp className="w-5 h-5 text-green-600" />}
              onCategoryClick={setSelectedIncomeCategory}
              selectedCategory={selectedIncomeCategory}
              getTransactionsByCategory={getTransactionsByCategory}
              transactionType="income"
            />
          </div>

          <RecentTransactions transactions={filteredTransactions} />

          <LineChartComponent
            data={lineChartData.data}
            xAxisDays={lineChartData.xAxisDays}
          />

          {/* Category Filters */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CategoryFilter
              title="دسته‌بندی هزینه‌ها"
              categories={expenseCategoryData}
              searchTerm={expenseSearchTerm}
              onSearchChange={setExpenseSearchTerm}
              getCategoryState={getExpenseCategoryState}
              onCategoryCheckboxChange={handleExpenseCategoryCheckboxChange}
              expandedCategories={expandedExpenseCategories}
              onToggleExpand={(categoryId) =>
                handleToggleExpand(
                  categoryId,
                  setExpandedExpenseCategories
                )
              }
              getTransactionsByCategory={getTransactionsByCategory}
              transactionCheckboxes={expenseTransactionCheckboxes}
              onTransactionCheckboxChange={(key, checked) =>
                setExpenseTransactionCheckboxes((prev) => ({
                  ...prev,
                  [key]: checked,
                }))
              }
              color="red"
              type="cost"
            />

            <CategoryFilter
              title="دسته‌بندی درآمدها"
              categories={incomeCategoryData}
              searchTerm={incomeSearchTerm}
              onSearchChange={setIncomeSearchTerm}
              getCategoryState={getIncomeCategoryState}
              onCategoryCheckboxChange={handleIncomeCategoryCheckboxChange}
              expandedCategories={expandedIncomeCategories}
              onToggleExpand={(categoryId) =>
                handleToggleExpand(
                  categoryId,
                  setExpandedIncomeCategories
                )
              }
              getTransactionsByCategory={getTransactionsByCategory}
              transactionCheckboxes={incomeTransactionCheckboxes}
              onTransactionCheckboxChange={(key, checked) =>
                setIncomeTransactionCheckboxes((prev) => ({
                  ...prev,
                  [key]: checked,
                }))
              }
              color="green"
              type="income"
            />
          </div>
        </>
      )}

      {activeTab === "future" && <FutureTransactionsPlaceholder />}
    </div>
  );
};

export default DashboardPage;
