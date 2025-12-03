import React, { useState } from "react";
import * as Lucide from "lucide-react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import type { Category } from "../App";

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState<keyof typeof Lucide>("Package");
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("expense");
  const [showIconSelector, setShowIconSelector] = useState(false);

  const handleAddCategory = () => {
    if (newCategoryName.trim() === "") return;

    setCategories([
      ...categories,
      { name: newCategoryName, icon: newCategoryIcon, type: newCategoryType },
    ]);
    setNewCategoryName("");
    setNewCategoryIcon("Package");
    setShowIconSelector(false);
  };

  const handleDeleteCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };

  const IconComponent = Lucide[newCategoryIcon] as React.FC;

  return (
    <Card title="مدیریت دسته‌بندی‌ها">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">افزودن دسته‌بندی جدید</h3>
          <div className="space-y-4">
            <Input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="نام دسته‌بندی"
              label="نام دسته‌بندی"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">نوع دسته‌بندی</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewCategoryType("income")}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    newCategoryType === "income"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  درآمد
                </button>
                <button
                  onClick={() => setNewCategoryType("expense")}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    newCategoryType === "expense"
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  هزینه
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">آیکون</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowIconSelector(!showIconSelector)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {IconComponent && React.cloneElement(<IconComponent />, { size: 20 })}
                  <span className="text-sm">{newCategoryIcon}</span>
                  <Lucide.ChevronDown size={16} className="text-gray-500" />
                </button>
              </div>

              {showIconSelector && (
                <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-6 gap-2">
                    {Object.keys(Lucide).slice(0, 50).map(iconName => {
                      const Icon = Lucide[iconName as keyof typeof Lucide] as React.FC;
                      return (
                        <button
                          key={iconName}
                          onClick={() => {
                            setNewCategoryIcon(iconName as keyof typeof Lucide);
                            setShowIconSelector(false);
                          }}
                          className={`p-2 rounded hover:bg-primary-50 transition-colors ${
                            newCategoryIcon === iconName ? 'bg-primary-100 ring-2 ring-primary-500' : ''
                          }`}
                        >
                          {React.cloneElement(<Icon />, { size: 20 })}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleAddCategory}
              className="w-full"
            >
              <Lucide.Plus className="w-4 h-4 mr-2" />
              افزودن دسته‌بندی
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">دسته‌بندی‌های شما</h3>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lucide.FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>هنوز دسته‌بندی وجود ندارد</p>
              <p className="text-sm">اولین دسته‌بندی خود را اضافه کنید</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category, index) => {
                const Icon = Lucide[category.icon] as React.FC;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                        {Icon && React.cloneElement(<Icon />, {
                          size: 20,
                          className: `${category.type === "income" ? "text-green-600" : "text-red-600"}`
                        })}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">{category.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                          category.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {category.type === "income" ? "درآمد" : "هزینه"}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteCategory(index)}
                    >
                      <Lucide.Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CategoryManager;
