import React, { useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import * as Lucide from "lucide-react";
import type { FrequentTransaction, Transaction } from "../App";
import { formatToman, parseTomanInput, fromTomanStorage } from "../utils/currency";

interface FrequentTransactionsProps {
  frequentTransactions: FrequentTransaction[];
  setFrequentTransactions: React.Dispatch<React.SetStateAction<FrequentTransaction[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const FrequentTransactions: React.FC<FrequentTransactionsProps> = ({
  frequentTransactions,
  setFrequentTransactions,
  transactions,
  setTransactions
}) => {
  const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState(0);

  const handleDelete = (index: number) => {
    const newFrequent = [...frequentTransactions];
    newFrequent.splice(index, 1);
    setFrequentTransactions(newFrequent);
  };

  const handleSaveTransaction = (frequent: FrequentTransaction) => {
    const newTransaction: Transaction = {
      type: frequent.type,
      totalAmount: frequent.totalAmount,
      items: frequent.items,
      category: frequent.category,
      date: new Date().toISOString(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const handleUpdatePrice = (index: number, newPrice: number) => {
    const newFrequent = [...frequentTransactions];
    newFrequent[index].totalAmount = newPrice;
    // Update item prices proportionally if it's a cost transaction
    if (newFrequent[index].type === "cost" && newFrequent[index].items.length > 0) {
      const totalOldPrice = newFrequent[index].items.reduce((sum, item) => sum + item.price * item.count, 0);
      if (totalOldPrice > 0) {
        newFrequent[index].items = newFrequent[index].items.map(item => ({
          ...item,
          price: (item.price / totalOldPrice) * newPrice
        }));
      }
    } else if (newFrequent[index].type === "income" && newFrequent[index].items.length > 0) {
      newFrequent[index].items[0].price = newPrice;
    }
    setFrequentTransactions(newFrequent);
    setEditingPriceIndex(null);
  };

  return (
    <Card title="تراکنش‌های تکراری">
      <div className="space-y-4">
        {frequentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            هنوز تراکنش تکراری‌ای ذخیره نکرده‌اید.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {frequentTransactions.map((transaction, index) => (
                <div key={index} className="shrink-0 w-64 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{transaction.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {transaction.type === "income" ? "درآمد" : "هزینه"} • {transaction.category}
                      </div>
                      <div className="text-sm font-semibold text-gray-700">
                        {editingPriceIndex === index ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={fromTomanStorage(editingPrice)}
                              onChange={(e) => setEditingPrice(parseTomanInput(e.target.value))}
                              className="w-20 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdatePrice(index, editingPrice);
                                } else if (e.key === 'Escape') {
                                  setEditingPriceIndex(null);
                                }
                              }}
                            />
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdatePrice(index, editingPrice)}
                            >
                              <Lucide.Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingPriceIndex(null)}
                            >
                              <Lucide.X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-gray-200 px-1 rounded"
                            onClick={() => {
                              setEditingPriceIndex(index);
                              setEditingPrice(transaction.totalAmount);
                            }}
                          >
                            {formatToman(transaction.totalAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      title="حذف"
                      className="ml-2"
                    >
                      <Lucide.Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveTransaction(transaction)}
                    className="w-full"
                    title="ذخیره تراکنش"
                  >
                    ذخیره
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FrequentTransactions;