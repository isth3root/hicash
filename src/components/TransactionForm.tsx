import React, { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Select from "./ui/Select";
import * as Lucide from "lucide-react";
import type { Category, Transaction, Item } from "../App";
import { fromTomanStorage, parseTomanInput, formatToman } from "../utils/currency";

interface TransactionFormProps {
    categories: Category[];
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ categories, transactions, setTransactions }) => {
  const [type, setType] = useState<"income" | "cost">("cost");
  const [totalAmount, setTotalAmount] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState(0);
  const [itemCount, setItemCount] = useState(1);
  const [category, setCategory] = useState("");

  // For income, we'll use a simplified approach
  const [incomeName, setIncomeName] = useState("");

  const handleAddItem = () => {
    if (itemName.trim() === "" || itemPrice <= 0) return;
    const count = type === "income" ? 1 : itemCount;
    if (type === "cost" && count <= 0) return;

    setItems([...items, { name: itemName, price: itemPrice, count: count }]);
    setItemName("");
    setItemPrice(0);
    if (type === "cost") {
      setItemCount(1);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (type === "income") {
      // Simple income: just need name and total amount
      if (incomeName.trim() === "" || totalAmount <= 0 || category === "") {
        alert("لطفاً تمام فیلدهای مورد نیاز برای درآمد را پر کنید.");
        return;
      }

      const newTransaction: Transaction = {
        type: "income",
        totalAmount,
        items: [{ name: incomeName, price: totalAmount, count: 1 }],
        category,
        date: new Date().toISOString(),
      };

      setTransactions([...transactions, newTransaction]);

      // Reset form
      setIncomeName("");
      setTotalAmount(0);
      setCategory("");
      return;
    }

    // For expenses: need items to match total amount
    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.count, 0);
    if (itemsTotal !== totalAmount) {
      alert("مجموع موارد با مبلغ کل مطابقت ندارد.");
      return;
    }
    if (category === "" || items.length === 0) {
        alert("لطفاً یک دسته‌بندی انتخاب کنید و حداقل یک مورد اضافه نمایید.");
        return;
    }

    const newTransaction: Transaction = {
      type: "cost",
      totalAmount,
      items,
      category,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);

    // Reset form
    setType("cost");
    setTotalAmount(0);
    setItems([]);
    setCategory("");
    setIncomeName("");
  };

  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.count, 0);
  const isFormValid = type === "income"
    ? incomeName.trim() !== "" && totalAmount > 0 && category !== ""
    : itemsTotal === totalAmount && category !== "" && items.length > 0;

  return (
    <Card title="ثبت تراکنش">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">نوع تراکنش</h3>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType("cost")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                type === "cost"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Lucide.TrendingDown className="w-5 h-5" />
                <span className="font-medium">هزینه</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                type === "income"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Lucide.TrendingUp className="w-5 h-5" />
                <span className="font-medium">درآمد</span>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="مبلغ کل (تومان)"
            type="number"
            value={totalAmount === 0 ? "" : fromTomanStorage(totalAmount)}
            onChange={(e) => setTotalAmount(parseTomanInput(e.target.value))}
            placeholder="0"
            prefix="تومان"
          />
          <Select
            label="دسته‌بندی"
            value={category}
            onChange={setCategory}
            options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
            placeholder="یک دسته‌بندی انتخاب کنید"
          />
        </div>

        {type === "income" ? (
          // Simplified income form
          <div className="space-y-4">
            <Input
              label="نام درآمد"
              type="text"
              value={incomeName}
              onChange={(e) => setIncomeName(e.target.value)}
              placeholder="مثال: حقوق، پاداش، هدیه"
            />

            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              className="w-full"
              disabled={!isFormValid}
            >
              {isFormValid ? 'ذخیره درآمد' : 'تکمیل فرم'}
            </Button>
          </div>
        ) : (
          // Full expense form
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">موارد هزینه</h3>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input
                  type="text"
                  label="نام"
                  placeholder="نام مورد"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <Input
                    type="number"
                    label="قیمت"
                    placeholder="قیمت"
                    value={fromTomanStorage(itemPrice)}
                    onChange={(e) => setItemPrice(parseTomanInput(e.target.value))}
                  />
                  {items.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setItemPrice(totalAmount)}
                      className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                      title="پر کردن خودکار با مبلغ کل"
                    >
                      <Lucide.Copy className="w-3 h-3" />
                      <span>کل مبلغ</span>
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  label="تعداد"
                  placeholder="تعداد"
                  value={itemCount}
                  onChange={(e) => setItemCount(parseInt(e.target.value))}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddItem}
                  className="w-full"
                >
                  افزودن
                </Button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 pb-2 border-b">
                  <span>جزئیات موارد</span>
                  <span>مجموع</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.count > 1 ? `${item.count} × ` : ''}${item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatToman(item.price * item.count)}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Lucide.Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-semibold">
                  <span>مجموع موارد:</span>
                  <span className={`${itemsTotal === totalAmount ? 'text-green-600' : 'text-red-600'}`}>
                    {formatToman(itemsTotal)}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              className="w-full"
              disabled={!isFormValid}
            >
              {isFormValid ? 'ذخیره هزینه' : 'تکمیل فرم'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TransactionForm;
