import React, { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";
import type { Transaction } from "../App";
import * as Lucide from "lucide-react";
import { fromTomanStorage, toTomanStorage, formatToman } from "../utils/currency";

interface BalanceProps {
  transactions: Transaction[];
}

const Balance: React.FC<BalanceProps> = ({ transactions }) => {
  const [initialBalance, setInitialBalance] = useLocalStorage<number>("initialBalance", 0);
  const [newInitialBalance, setNewInitialBalance] = useState(initialBalance);
  const [isEditing, setIsEditing] = useState(false);

  const currentBalance = useMemo(() => {
    const balanceFromTransactions = transactions.reduce((acc, transaction) => {
      if (transaction.type === "income") {
        return acc + transaction.totalAmount;
      }
      return acc - transaction.totalAmount;
    }, 0);
    return initialBalance + balanceFromTransactions;
  }, [initialBalance, transactions]);

  const handleSetInitialBalance = () => {
    setInitialBalance(newInitialBalance);
    setIsEditing(false);
  };

  const balanceColor = currentBalance >= 0 ? "text-green-600" : "text-red-600";

  return (
    <Card className="animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">بالانس فعلی</h2>
          <p className="text-sm text-gray-500">مرور مالی شما</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              ویرایش اولیه
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              لغو
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold mb-2">{formatToman(currentBalance)}</div>
        <div className={`flex items-center gap-2 ${balanceColor}`}>
          {currentBalance >= 0 ? (
            <Lucide.TrendingUp className="w-5 h-5" />
          ) : (
            <Lucide.TrendingDown className="w-5 h-5" />
          )}
          <span className="font-medium">
            {currentBalance >= 0 ? "بالانس مثبت" : "بالانس منفی"}
          </span>
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-4 items-end">
          <Input
            type="number"
            value={fromTomanStorage(newInitialBalance)}
            onChange={(e) => setNewInitialBalance(toTomanStorage(parseFloat(e.target.value)))}
            placeholder="تنظیم بالانس اولیه (تومان)"
            className="flex-1"
          />
          <Button
            variant="primary"
            size="md"
            onClick={handleSetInitialBalance}
          >
            به‌روزرسانی بالانس اولیه
          </Button>
        </div>
      )}
    </Card>
  );
};

export default Balance;
