import React, { useState, forwardRef, useImperativeHandle } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Select from "./ui/Select";
import * as Lucide from "lucide-react";
import { DatePicker } from "zaman";
import type { Category, Transaction, Item, FrequentTransaction } from "../App";
import { fromTomanStorage, parseTomanInput, formatToman } from "../utils/currency";

interface TransactionFormProps {
    categories: Category[];
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    frequentTransactions: FrequentTransaction[];
    setFrequentTransactions: React.Dispatch<React.SetStateAction<FrequentTransaction[]>>;
    onLoadFrequent?: (frequent: FrequentTransaction) => void;
}

const TransactionForm = forwardRef<{ loadFrequent: (frequent: FrequentTransaction) => void }, TransactionFormProps>(
  ({ categories, transactions, setTransactions, frequentTransactions, setFrequentTransactions }, ref) => {
  const [type, setType] = useState<"income" | "cost">("cost");
  const [totalAmount, setTotalAmount] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState(0);
  const [itemCount, setItemCount] = useState(1);
  const [category, setCategory] = useState("");
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());

  // For income, we'll use a simplified approach
  const [incomeName, setIncomeName] = useState("");

  const loadFrequentTransaction = (frequent: FrequentTransaction) => {
    setType(frequent.type);
    setTotalAmount(frequent.totalAmount);
    setItems(frequent.items);
    setCategory(frequent.category);
    setTransactionDate(new Date());
    if (frequent.type === "income") {
      setIncomeName(frequent.items[0]?.name || "");
    } else {
      setIncomeName("");
      setItemName("");
      setItemPrice(0);
      setItemCount(1);
    }
  };

  useImperativeHandle(ref, () => ({
    loadFrequent: loadFrequentTransaction
  }));

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

  const handleAddItemRow = () => {
    setItems([...items, { name: "", price: 0, count: 1 }]);
  };

  const handleUpdateItem = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
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
        date: transactionDate.toISOString(),
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
      date: transactionDate.toISOString(),
    };

    setTransactions([...transactions, newTransaction]);

    // Reset form
    setType("cost");
    setTotalAmount(0);
    setItems([]);
    setCategory("");
    setIncomeName("");
  };

  const saveAsFrequent = () => {
    const name = prompt("نام تراکنش تکراری را وارد کنید:");
    if (!name || name.trim() === "") return;

    const frequent: FrequentTransaction = {
      name: name.trim(),
      type,
      totalAmount,
      items,
      category,
    };

    setFrequentTransactions([...frequentTransactions, frequent]);
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

        {/* Date Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">تاریخ تراکنش</label>
          <DatePicker
            onChange={(date) => {
              if (date && date.value) {
                setTransactionDate(date.value);
              }
            }}
            className="w-full zaman-datepicker"
            inputClass="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
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

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={saveAsFrequent}
                className="flex-1"
                disabled={!isFormValid}
                title="ذخیره به عنوان تراکنش تکراری"
              >
                ذخیره تکراری
              </Button>
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
                  <div className="flex items-center gap-2">
                    <span>جزئیات موارد</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAddItemRow}
                      className="text-xs"
                    >
                      <Lucide.Plus className="w-3 h-3 mr-1" />
                      ردیف جدید
                    </Button>
                  </div>
                  <span>مجموع</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-4 gap-3 mb-2">
                        <Input
                          type="text"
                          placeholder="نام"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="قیمت"
                          value={fromTomanStorage(item.price)}
                          onChange={(e) => handleUpdateItem(index, 'price', parseTomanInput(e.target.value))}
                          className="text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="تعداد"
                          value={item.count}
                          onChange={(e) => handleUpdateItem(index, 'count', parseInt(e.target.value) || 1)}
                          className="text-sm"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-sm">{formatToman(item.price * item.count)}</span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Lucide.Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={saveAsFrequent}
                className="flex-1"
                disabled={!isFormValid}
                title="ذخیره به عنوان تراکنش تکراری"
              >
                ذخیره تکراری
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                className="flex-1"
                disabled={!isFormValid}
              >
                {isFormValid ? 'ذخیره هزینه' : 'تکمیل فرم'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});

TransactionForm.displayName = 'TransactionForm';

export default TransactionForm;
