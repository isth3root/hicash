import React from "react";
import TransactionForm from "../components/TransactionForm";
import type { Category, Transaction } from "../App";

interface TransactionPageProps {
  categories: Category[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const TransactionPage: React.FC<TransactionPageProps> = ({
  categories,
  transactions,
  setTransactions
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <TransactionForm
          categories={categories}
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </div>

    </div>
  );
};

export default TransactionPage;