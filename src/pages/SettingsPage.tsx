import React, { useState } from "react";
import Card from "../components/ui/Card";
import ThemeSwitcher from "../components/ThemeSwitcher";
import CategoryManager from "../components/CategoryManager";
import * as Lucide from "lucide-react";
import type { Category } from "../App";

interface SettingsPageProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ categories, setCategories }) => {
  const [activeTab, setActiveTab] = useState<"theme" | "categories">("theme");

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("theme")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === "theme"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lucide.Palette className="w-5 h-5" />
              <span>تنظیمات تم</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === "categories"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lucide.Folder className="w-5 h-5" />
              <span>مدیریت دسته‌بندی‌ها</span>
            </div>
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === "theme" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">تنظیمات تم</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lucide.Sun className="w-6 h-6 text-yellow-500" />
                  <span className="font-medium text-gray-800">تغییر تم</span>
                </div>
                <ThemeSwitcher />
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <CategoryManager
              categories={categories}
              setCategories={setCategories}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;