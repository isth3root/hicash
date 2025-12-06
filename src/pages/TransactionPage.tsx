import React, { useRef } from "react";
import TransactionForm from "../components/TransactionForm";
import FrequentTransactions from "../components/FrequentTransactions";
import type { Category, Transaction, FrequentTransaction } from "../App";

interface TransactionPageProps {
  categories: Category[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  frequentTransactions: FrequentTransaction[];
  setFrequentTransactions: React.Dispatch<React.SetStateAction<FrequentTransaction[]>>;
}

const TransactionPage: React.FC<TransactionPageProps> = ({
  categories,
  transactions,
  setTransactions,
  frequentTransactions,
  setFrequentTransactions
}) => {
  const formRef = useRef<{ loadFrequent: (frequent: FrequentTransaction) => void }>(null);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
        <TransactionForm
          ref={formRef}
          categories={categories}
          transactions={transactions}
          setTransactions={setTransactions}
          frequentTransactions={frequentTransactions}
          setFrequentTransactions={setFrequentTransactions}
        />
      </div>
      <div className="space-y-6 order-1 lg:order-2">
        <FrequentTransactions
          frequentTransactions={frequentTransactions}
          setFrequentTransactions={setFrequentTransactions}
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </div>
    </div>
  );
};

export default TransactionPage;