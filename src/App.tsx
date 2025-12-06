import { useLocalStorage } from "./hooks/useLocalStorage";
import { useState, useEffect } from "react";
import { useTheme } from "./context/ThemeContext";
import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import MobileNavigation from "./components/MobileNavigation";
import TransactionPage from "./pages/TransactionPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import * as Lucide from "lucide-react";

export interface Category {
  name: string;
  icon: keyof typeof Lucide;
  type: "income" | "expense";
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

export interface FrequentTransaction {
    name: string;
    type: "income" | "cost";
    totalAmount: number;
    items: Item[];
    category: string;
}

const App = () => {
  const { theme } = useTheme();
  const [categories, setCategories] = useLocalStorage<Category[]>("categories", []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("transactions", []);
  const [frequentTransactions, setFrequentTransactions] = useLocalStorage<FrequentTransaction[]>("frequentTransactions", []);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
        <div className="text-center">
          <div className="animate-spin">
            <Lucide.Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">در حال بارگزاری اطلاعات مالی شما</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background}`}>
      <Navigation />
      <MobileNavigation />

      <div className="py-8 px-4 sm:px-6 lg:px-8 md:pb-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <TransactionPage
                  categories={categories}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  frequentTransactions={frequentTransactions}
                  setFrequentTransactions={setFrequentTransactions}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  transactions={transactions}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  categories={categories}
                  setCategories={setCategories}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
