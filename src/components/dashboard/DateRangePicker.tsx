import React from "react";
import { DatePicker } from "zaman";
import * as Lucide from "lucide-react";

interface DateRangePickerProps {
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  normalizeZamanDate: (input: any) => Date | null;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  normalizeZamanDate,
}) => {
  const handleQuickRange = (daysBack: number) => {
    const today = new Date();
    onDateRangeChange({
      start: new Date(today.setDate(today.getDate() - daysBack)),
      end: new Date(),
    });
  };

  const handleThisMonth = () => {
    const today = new Date();
    onDateRangeChange({
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(),
    });
  };

  const handleThisYear = () => {
    const today = new Date();
    onDateRangeChange({
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date(),
    });
  };

  return (
    <div className="mb-6">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Lucide.Calendar className="w-5 h-5 text-blue-600" />
            بازه زمانی
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickRange(7)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              هفته گذشته
            </button>
            <button
              onClick={handleThisMonth}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              این ماه
            </button>
            <button
              onClick={handleThisYear}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              امسال
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              از تاریخ
            </label>
            <div className="relative">
              <DatePicker
                onChange={(date) => {
                  if (date) {
                    const d = normalizeZamanDate(date);
                    onDateRangeChange({ ...dateRange, start: d });
                  }
                }}
                className="w-full zaman-datepicker "
                inputClass="w-full rounded-lg border-2 border-gray-300 bg-white px-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
              <Lucide.Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تا تاریخ
            </label>
            <div className="relative">
              <DatePicker
                onChange={(date) => {
                  if (date) {
                    const d = normalizeZamanDate(date);
                    onDateRangeChange({ ...dateRange, end: d });
                  }
                }}
                className="w-full zaman-datepicker "
                inputClass="w-full rounded-lg border-2 border-gray-300 bg-white px-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
              <Lucide.Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>
        {dateRange.start || dateRange.end ? (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Lucide.Info className="w-4 h-4 text-blue-600" />
              <span>
                بازه زمانی انتخاب شده:
                <span className="font-medium">
                  {" "}
                  {dateRange.start
                    ? dateRange.start.toLocaleDateString("fa-IR")
                    : "---"}
                </span>
                <span className="mx-1">تا</span>
                <span className="font-medium">
                  {" "}
                  {dateRange.end
                    ? dateRange.end.toLocaleDateString("fa-IR")
                    : "---"}
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DateRangePicker;
