import Balance from "./components/Balance";
import CategoryManager from "./components/CategoryManager";
import TransactionForm from "./components/TransactionForm";
import { useLocalStorage } from "./hooks/useLocalStorage";
import * as Lucide from "lucide-react";

export interface Category {
  name: string;
  icon: keyof typeof Lucide;
}

export interface Item {
    name: string;
    price: number;
    count: number;
}

export interface Transaction {
    type: "income" | "cost";
    totalAmount: number;
    items: Item[];
    category: string;
    date: string;
}

const App = () => {
  const [categories, setCategories] = useLocalStorage<Category[]>("categories", []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("transactions", []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Personal Accounting</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Balance transactions={transactions} />
          <CategoryManager categories={categories} setCategories={setCategories} />
        </div>
        <div>
          <TransactionForm categories={categories} transactions={transactions} setTransactions={setTransactions} />
        </div>
      </div>
    </div>
  );
};

export default App;
