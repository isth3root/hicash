import React, { useState } from "react";
import * as Lucide from "lucide-react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { Category } from "../App";

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState<keyof typeof Lucide>("Package");

  const handleAddCategory = () => {
    if (newCategoryName.trim() === "") return;

    setCategories([
      ...categories,
      { name: newCategoryName, icon: newCategoryIcon },
    ]);
    setNewCategoryName("");
  };

  const handleDeleteCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };

  const IconComponent = Lucide[newCategoryIcon] as React.FC;

  return (
    <Card>
        <h2 className="text-xl font-bold mb-4">Manage Categories</h2>
        <div className="flex gap-4 mb-4">
            <Input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category Name"
            />
            <div className="flex items-center gap-2">
                {IconComponent && <IconComponent />}
                <select value={newCategoryIcon} onChange={e => setNewCategoryIcon(e.target.value as keyof typeof Lucide)} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    {Object.keys(Lucide).map(iconName => (
                        <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                </select>
            </div>

            <Button onClick={handleAddCategory}>Add Category</Button>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Existing Categories:</h3>
            <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => {
                const Icon = Lucide[category.icon] as React.FC;
                return (
                <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon />}
                        <span>{category.name}</span>
                    </div>
                    <Button onClick={() => handleDeleteCategory(index)}>Delete</Button>
                </div>
                );
            })}
            </div>
      </div>
    </Card>
  );
};

export default CategoryManager;
