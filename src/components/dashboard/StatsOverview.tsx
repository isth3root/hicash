import React from "react";
import * as Lucide from "lucide-react";
import StatCard from "./StatCard";

interface StatsOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  period: 'month' | 'week' | 'year';
  onPeriodChange: (period: 'month' | 'week' | 'year') => void;
  onBalanceChange: (balance: number | null) => void;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalIncome,
  totalExpenses,
  currentBalance,
  period,
  onPeriodChange,
  onBalanceChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="کل درآمد"
        value={totalIncome}
        icon={<Lucide.TrendingUp className="w-6 h-6 text-green-600" />}
        color="green"
        period={period}
        onPeriodChange={onPeriodChange}
      />
      <StatCard
        title="کل هزینه‌ها"
        value={totalExpenses}
        icon={<Lucide.TrendingDown className="w-6 h-6 text-red-600" />}
        color="red"
        period={period}
        onPeriodChange={onPeriodChange}
        animationDelay="0.1s"
      />
      <StatCard
        title="بالانس فعلی"
        value={currentBalance}
        icon={<Lucide.Wallet className="w-6 h-6 text-primary-600" />}
        color="primary"
        isBalance={true}
        onBalanceChange={onBalanceChange}
        animationDelay="0.2s"
      />
    </div>
  );
};

export default StatsOverview;
