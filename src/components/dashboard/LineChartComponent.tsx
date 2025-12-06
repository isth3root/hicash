import React from "react";
import Card from "../ui/Card";
import { ResponsiveLine } from "@nivo/line";
import * as Lucide from "lucide-react";

interface LineChartDataPoint {
  x: string;
  y: number | null;
  value: number;
  dayOnly: string;
}

interface LineChartComponentProps {
  data: Array<{
    id: string;
    data: LineChartDataPoint[];
  }>;
  xAxisDays: string[];
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({
  data,
  xAxisDays,
}) => {
  if (xAxisDays.length === 0) {
    return (
      <Card title="روند هزینه‌ها و بالانس">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center py-8 text-gray-500">
            <Lucide.TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>داده‌ای برای نمایش نمودار روند وجود ندارد</p>
            <p className="text-sm">لطفا یک بازه زمانی معتبر انتخاب کنید</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="روند هزینه‌ها و بالانس">
      <div className="h-[400px]">
        <ResponsiveLine
          data={data}
          colors={({ id }) => (id === "هزینه‌ها" ? "#8B5CF6" : "#10B981")}
          theme={{
            text: {
              fontFamily: "AradVF",
              fontSize: 14,
              fill: "#374151",
            },
            axis: {
              legend: {
                text: {
                  fontFamily: "AradVF",
                  fontSize: 15,
                  fill: "#111827",
                },
              },
            },
            legends: {
              text: {
                fontFamily: "AradVF",
                fontSize: 12,
              },
            },
            tooltip: {
              container: {
                fontFamily: "AradVF",
                fontSize: 12,
              },
            },
          }}
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.0f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "تاریخ",
            legendOffset: 40,
            legendPosition: "middle",
            format: (value) => value,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "قیمت (تومان)",
            legendOffset: -50,
            legendPosition: "middle",
            format: (value) => value.toLocaleString("fa-IR"),
          }}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          enableArea={true}
          areaOpacity={0.3}
          areaBaselineValue={0}
          enableSlices="x"
          enableGridX={false}
          enableGridY={true}
          curve="monotoneX"
          lineWidth={3}
          areaBlendMode="multiply"
          enableCrosshair={true}
          crosshairType="cross"
          enablePointLabel={false}
          sliceTooltip={({ slice }) => {
            const xValue = slice.points[0].data.x;
            return (
              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <div className="font-semibold text-gray-800">{xValue}</div>
                {slice.points.map((point) => (
                  <div
                    key={point.id}
                    className="text-sm text-gray-600 mt-1 flex justify-between"
                  >
                    <span>{point.seriesId}:</span>
                    <span>
                      {point.data.y !== null
                        ? Math.round(point.data.y).toLocaleString("fa-IR")
                        : "بدون داده"}{" "}
                      تومان
                    </span>
                  </div>
                ))}
              </div>
            );
          }}
        />
      </div>
    </Card>
  );
};

export default LineChartComponent;
