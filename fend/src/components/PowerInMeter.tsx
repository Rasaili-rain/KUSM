
import { Link } from "react-router-dom";
import type { Meter, MeterData } from "@/lib/types";

export type PowerInMeterProps = {
  meters: Meter[],
  meterDataMap: { [meterId: number]: MeterData };
};

export function PowerInMeter({ meters , meterDataMap }: PowerInMeterProps) {
  const calculatePower = (meterId: number): number | string => {
    const data = meterDataMap[meterId];
    if (!data) return "—";

    const power =
      data.phase_A_active_power +
      data.phase_B_active_power +
      data.phase_C_active_power;

    return power.toFixed(2);
  };

  return (
    <>
      <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hidden group-hover:scrollbar-visible">
        <div className="flex flex-row gap-6 px-4 whitespace-nowrap">
          {meters.map((meter) => {
            const path = `/meter/${meter.meter_id}`;

            return (
              <div
                key={meter.meter_id}
                className="flex flex-col min-w-[250px]"
              >
                <Link
                  to={path}
                  className="flex items-center gap-3 p-3 text-sm rounded-md transition"
                  state={{ title: meter.name }}
                >
                  <span className="truncate">{meter.name}</span>
                </Link>

                <div className="bg-indigo-100 text-center p-10 m-2 rounded-2xl font-bold text-2xl text-gray-600 mb-5">
                  {calculatePower(meter.meter_id)}
                  W
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>

  );
}
