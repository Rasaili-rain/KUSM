import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type MeterPowerRow = {
  meter_name: string;
  power: number;
  trend: "up" | "down" | "same";
  deltaPercent: number;
};

export function PowerTable({ data }: { data?: MeterPowerRow[] | null }) {
  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Fetching power…</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="p-4 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Meter Power
        </h3>
        <span className="text-xs text-gray-400">avg · last 5 min</span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-xs border-b">
            <th className="text-left pb-2 font-medium">Meter</th>
            <th className="text-right pb-2 font-medium">Power</th>
            <th className="text-right pb-2 font-medium">Trend</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {data.map((row) => {
            const isUp = row.trend === "up";
            const isDown = row.trend === "down";

            return (
              <tr
                key={row.meter_name}
                className="group hover:bg-gray-50 transition-colors"
              >
                {/* Meter Name */}
                <td className="py-3 font-medium text-gray-700">
                  {row.meter_name}
                </td>

                {/* Power */}
                <td className="py-3 text-right tabular-nums text-gray-900">
                  {(row.power / 1000).toFixed(2)}
                  <span className="ml-1 text-xs text-gray-400">kW</span>
                </td>

                {/* Trend */}
                <td className="py-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                      ${
                        isUp
                          ? "bg-emerald-50 text-emerald-600"
                          : isDown
                          ? "bg-rose-50 text-rose-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {isUp && <TrendingUp size={14} />}
                    {isDown && <TrendingDown size={14} />}
                    {row.trend === "same" && <Minus size={14} />}

                    {Math.abs(row.deltaPercent)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
