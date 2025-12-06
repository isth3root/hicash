import React from "react";
import * as Lucide from "lucide-react";

const FutureTransactionsPlaceholder: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Lucide.Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        تراکنش‌های آینده
      </h3>
      <p className="text-gray-500">
        این بخش برای نمایش تراکنش‌های برنامه‌ریزی شده آینده است
      </p>
      <p className="text-sm text-gray-400 mt-1">
        تراکنش‌های آینده شما در اینجا نمایش داده خواهند شد
      </p>
    </div>
  );
};

export default FutureTransactionsPlaceholder;
