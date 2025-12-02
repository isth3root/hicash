import React, { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { Category, Transaction, Item } from "../App";

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

  const handleAddItem = () => {
    if (itemName.trim() === "" || itemPrice <= 0 || itemCount <= 0) return;
    setItems([...items, { name: itemName, price: itemPrice, count: itemCount }]);
    setItemName("");
    setItemPrice(0);
    setItemCount(1);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = () => {
    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.count, 0);
    if (itemsTotal !== totalAmount) {
      alert("The sum of the items does not match the total amount.");
      return;
    }
    if (category === "") {
        alert("Please select a category.");
        return;
    }

    const newTransaction: Transaction = {
      type,
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
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
      <div className="mb-4">
        <label htmlFor="cost" className="mr-4">
          <input
            id="cost"
            type="radio"
            value="cost"
            checked={type === "cost"}
            onChange={() => setType("cost")}
          />
          Cost
        </label>
        <label htmlFor="income">
          <input
            id="income"
            type="radio"
            value="income"
            checked={type === "income"}
            onChange={() => setType("income")}
          />
          Income
        </label>
      </div>
      <div className="mb-4">
        <label htmlFor="totalAmount" className="block text-gray-700 text-sm font-bold mb-2">
          Total Amount
        </label>
        <Input
          id="totalAmount"
          type="number"
          value={totalAmount}
          onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
          Category
        </label>
        <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value="">Select a category</option>
            {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
        </select>
      </div>
      <div className="border p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Items</h3>
        <div className="flex gap-4 mb-4">
            <Input
                type="text"
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
            />
            <Input
                type="number"
                placeholder="Price"
                value={itemPrice}
                onChange={(e) => setItemPrice(parseFloat(e.target.value))}
            />
            <Input
                type="number"
                placeholder="Count"
                value={itemCount}
                onChange={(e) => setItemCount(parseInt(e.target.value))}
            />
            <Button onClick={handleAddItem}>Add Item</Button>
        </div>
        <ul>
            {items.map((item, index) => (
                <li key={index} className="flex justify-between items-center mb-2">
                    <span>{item.name} - {item.count} x ${item.price}</span>
                    <Button onClick={() => handleRemoveItem(index)}>Remove</Button>
                </li>
            ))}
        </ul>
      </div>
      <Button onClick={handleSubmit}>Save Transaction</Button>
    </Card>
  );
};

export default TransactionForm;
