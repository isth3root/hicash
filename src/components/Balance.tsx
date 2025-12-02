import React, { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { Transaction } from "../App";

interface BalanceProps {
  transactions: Transaction[];
}

const Balance: React.FC<BalanceProps> = ({ transactions }) => {
  const [initialBalance, setInitialBalance] = useLocalStorage<number>("initialBalance", 0);
  const [newInitialBalance, setNewInitialBalance] = useState(initialBalance);

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
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Current Balance</h2>
      <p className="text-2xl mb-4">${currentBalance.toFixed(2)}</p>
      <div className="flex gap-4">
        <Input
          type="number"
          value={newInitialBalance}
          onChange={(e) => setNewInitialBalance(parseFloat(e.target.value))}
          placeholder="Set Initial Balance"
        />
        <Button onClick={handleSetInitialBalance}>Set Initial Balance</Button>
      </div>
    </Card>
  );
};

export default Balance;
