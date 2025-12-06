import React, { useState, useEffect } from "react";
import { formatToman } from "../../utils/currency";
import Select from "../ui/Select";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "green" | "red" | "primary";
  secondaryText?: string;
  animationDelay?: string;
  period?: 'month' | 'week' | 'year';
  onPeriodChange?: (period: 'month' | 'week' | 'year') => void;
  isBalance?: boolean;
  onBalanceChange?: (balance: number | null) => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  secondaryText,
  animationDelay = "0s",
  period,
  onPeriodChange,
  isBalance,
  onBalanceChange,
}) => {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);
  const colorClasses = {
    green: {
      bg: "bg-green-100",
      icon: "text-green-600",
      value: "text-green-600",
    },
    red: {
      bg: "bg-red-100",
      icon: "text-red-600",
      value: "text-red-600",
    },
    primary: {
      bg: "bg-primary-100",
      icon: "text-primary-600",
      value: value >= 0 ? "text-green-600" : "text-red-600",
    },
  };

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow fade-in-up"
      style={{ animationDelay }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-3 ${colorClasses[color].bg} rounded-lg`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${colorClasses[color].value}`}>
            {formatToman(value)}
          </p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        {period && onPeriodChange ? (
          <Select
            value={period}
            onChange={(val) => onPeriodChange(val as 'month' | 'week' | 'year')}
            options={[
              { value: 'month', label: 'ماه' },
              { value: 'week', label: 'هفته' },
              { value: 'year', label: 'سال' },
            ]}
          />
        ) : isBalance && onBalanceChange ? (
          isEditingBalance ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  const num = parseFloat(editValue);
                  if (!isNaN(num)) {
                    onBalanceChange(num);
                  }
                  setIsEditingBalance(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const num = parseFloat(editValue);
                    if (!isNaN(num)) {
                      onBalanceChange(num);
                    }
                    setIsEditingBalance(false);
                  } else if (e.key === 'Escape') {
                    setEditValue(value.toString());
                    setIsEditingBalance(false);
                  }
                }}
                className="text-xs text-gray-400 uppercase tracking-wider bg-transparent border-none outline-none w-full"
                autoFocus
              />
            </div>
          ) : (
            <p
              className="text-xs text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600"
              onClick={() => setIsEditingBalance(true)}
            >
              کلی (کلیک برای ویرایش)
            </p>
          )
        ) : (
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            {secondaryText || "کلی"}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
