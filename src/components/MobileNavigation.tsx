import React from "react";
import { Link, useLocation } from "react-router-dom";
import * as Lucide from "lucide-react";

const MobileNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      name: "تراکنش‌ها",
      icon: <Lucide.ReceiptText className="w-6 h-6" />,
    },
    {
      path: "/dashboard",
      name: "داشبورد",
      icon: <Lucide.PieChart className="w-6 h-6" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-20">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              location.pathname === item.path
                ? "bg-primary-100 text-primary-700 font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {item.icon}
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}

        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors ${
            location.pathname === "/settings"
              ? "bg-primary-100 text-primary-700 font-medium"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Lucide.Settings className="w-6 h-6" />
          <span className="text-xs">تنظیمات</span>
        </Link>

        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
            <Lucide.User className="w-5 h-5" />
          </div>
          <span className="text-xs">پروفایل</span>
        </div>
      </div>
    </nav>
  );
};

export default MobileNavigation;