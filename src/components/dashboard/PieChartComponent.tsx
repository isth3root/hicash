import React from "react";
import { ResponsivePie } from "@nivo/pie";
import * as Lucide from "lucide-react";

interface PieChartComponentProps {
  title: string;
  data: Array<{ id: string; label: string; value: number }>;
  colorScheme: "reds" | "greens";
  icon: React.ReactNode;
  onCategoryClick: (categoryId: string) => void;
  selectedCategory: string | null;
  getTransactionsByCategory: (
    category: string,
    type: "income" | "cost"
  ) => any[];
  transactionType: "income" | "cost";
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({
  title,
  data,
  colorScheme,
  icon,
  onCategoryClick,
  selectedCategory,
  getTransactionsByCategory,
  transactionType,
}) => {
  const calculateTransactionPercentages = (transactions: any[]) => {
    if (transactions.length === 0) return transactions;

    const total = transactions.reduce((sum, t) => sum + t.displayAmount, 0);
    return transactions.map((t) => ({
      ...t,
      percentage: total > 0 ? (t.displayAmount / total) * 100 : 0,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {data.length > 0 ? (
        <div className="h-[400px]">
          <ResponsivePie
            data={data}
            margin={{ top: 20, right: 20, bottom: 120, left: 20 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: colorScheme }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            tooltip={(datum) => {
              const total = data.reduce((sum, item) => sum + item.value, 0);
              const percentage =
                total > 0
                  ? ((datum.datum.value / total) * 100).toFixed(1)
                  : "0";
              return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                  <div className="font-semibold text-gray-800">
                    {datum.datum.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {datum.datum.value.toLocaleString("fa-IR")} تومان (
                    {percentage}%)
                  </div>
                </div>
              );
            }}
            onClick={(datum) => onCategoryClick(String(datum.id))}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 96,
                itemsSpacing: 10,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                symbolSize: 18,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
              },
            ]}
            theme={{
              labels: {
                text: {
                  fontSize: 14,
                  fontWeight: 600,
                },
              },
              legends: {
                text: {
                  fontSize: 12,
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Lucide.PieChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>داده‌ای برای نمایش نمودار وجود ندارد</p>
          <p className="text-sm">تراکنشی در بازه زمانی انتخاب شده یافت نشد</p>
        </div>
      )}

      {selectedCategory && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Lucide.List className="w-4 h-4" />
            تراکنش‌های دسته {selectedCategory}
          </h4>
          {(() => {
            const transactions = getTransactionsByCategory(
              selectedCategory,
              transactionType
            );
            const transactionsWithPercentages =
              calculateTransactionPercentages(transactions);

            if (transactionsWithPercentages.length === 0) {
              return (
                <div className="text-center py-4 text-gray-500 text-sm">
                  تراکنشی در این دسته‌بندی یافت نشد
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {transactionsWithPercentages.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 ${
                          transactionType === "cost"
                            ? "bg-red-100"
                            : "bg-green-100"
                        } rounded-full flex items-center justify-center`}
                      >
                        {transactionType === "cost" ? (
                          <Lucide.TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <Lucide.TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(transaction.date).toLocaleDateString(
                            "fa-IR"
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.items.length} آیتم
                        </div>
                        <div className="text-xs text-gray-400">
                          {transaction.items
                            .map((item: any) => item.name)
                            .join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold ${
                          transactionType === "cost"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {transaction.displayAmount.toLocaleString("fa-IR")}{" "}
                        تومان
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default PieChartComponent;
