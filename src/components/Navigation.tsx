import React from "react";
import { Link, useLocation } from "react-router-dom";
import * as Lucide from "lucide-react";

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      name: "تراکنش‌ها",
      icon: <Lucide.ReceiptText className="w-5 h-5" />,
    },
    {
      path: "/dashboard",
      name: "داشبورد",
      icon: <Lucide.PieChart className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="hidden md:block bg-white shadow-sm border-b  border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <Lucide.DollarSign className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">های کش</span>
            </Link>

            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary-100 text-primary-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/settings"
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              title="تنظیمات"
            >
              <Lucide.Settings className="w-5 h-5" />
            </Link>

            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
              <Lucide.User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;