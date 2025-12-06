import React from "react";
import Card from "../ui/Card";
import * as Lucide from "lucide-react";
import { formatToman } from "../../utils/currency";
import type { Transaction } from "../../App";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  return (
    <div className="mt-8">
      <Card title="فعالیت‌های اخیر">
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lucide.Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>تراکنشی در این بازه زمانی یافت نشد</p>
              <p className="text-sm">
                تراکنش‌های شما در این بازه زمانی نمایش داده خواهند شد
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction, index) => (
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
                        {new Date(transaction.date).toLocaleDateString("fa-IR")}
                      </div>
                      <div className="text-xs text-gray-400">
                        {transaction.items.map((item) => item.name).join(", ")}
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
  );
};

export default RecentTransactions;
