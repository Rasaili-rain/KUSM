import { useState, useEffect } from "react";
import {
  Receipt,
  Calculator,
  CalendarDays,
  RefreshCcw,
} from "lucide-react";

import { useMeterStore } from "@/stores/meterStore";
import type { BillingResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { COLORS, getCurrentMonth, getColorByID} from "@/lib/utils";
import { OverviewInfoCard } from "@components/OverviewInfoCard";
import { LineGraph, type LineGraphPoint } from "@components/LineGraph";
import { PieGraph, type PieGraphPoint } from "@components/PieGraph";
import { BarGraph, type BarGraphData } from "@components/BarGraph";

export default function Billing() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [year, month] = selectedMonth.split("-").map(Number);

  const meters = useMeterStore((state) => state.meters);
  const meterIdToName = Object.fromEntries(
    meters.map((m) => [m.meter_id, m.name])
  );

  const [billData, setBillData] = useState<BillingResponse | null>(null);
  const [costPerDayPoints, setCostPerDayPoints] = useState<LineGraphPoint[]|null>(null);
  const [costPerMeterData, setCostPerMeterData] = useState<PieGraphPoint[]|null>(null);
  const [weekDayData, setWeekDayData] = useState<BarGraphData[]|null>(null);

  const [loading, setLoading] = useState(true);

  const reCalculateBill = async () => {
    setLoading(true);

    const doBilling = async () => {
      try {
        await api.billing.doBill(year, month);
      } catch (err) {
        console.error(err);
      }
    };

    const getBill = async () => {
      try {
        const res = await api.billing.getBillingData(year, month);
        setBillData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    await doBilling();
    await getBill();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.billing.getBillingData(year, month);
        setBillData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [year, month]);

  // Extract daily cost data
  useEffect(() => {
    let points: LineGraphPoint = {
      label: "Daily Cost",
      color: "#6D28D9",
      data: billData?.cost_per_day.map((d) => ({
        x: d.day,
        y: d.cost,
      })) ?? [],
    }

    if (points.data.length > 0) {
      setCostPerDayPoints([points]);
    } else {
      setCostPerDayPoints(null);
    }

  }, [billData]);

  // Extract per meter cost
  useEffect(() => {
    const data = billData
      ? billData.cost_per_meter.map((m) => ({
          id: m.meter_id,
          label: meterIdToName[m.meter_id] ?? `Meter ${m.meter_id}`,
          value: m.cost,
          color: getColorByID(m.meter_id),
        }))
      : null;

    setCostPerMeterData(data);
  }, [billData]);

  // Extract average day cost
  useEffect(() => {
    const weekdayOrder = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let data = billData
      ? weekdayOrder.map(day => ({
          label: day.slice(0, 3),
          value: billData.avg_cost_per_weekday[day as keyof typeof billData.avg_cost_per_weekday] ?? 0,
        }))
      : null;
    setWeekDayData(data);
  }, [billData]);

  useEffect(() => {
    console.log(costPerDayPoints);
  }, [costPerDayPoints]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 animate-spin" />
          </div>

          <div className="text-center">
            <div className="text-lg font-medium text-gray-900">
              Calculating bill
            </div>
             <div className="text-sm text-gray-500 animate-pulse">
              Aggregating meter data and costs…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[30%_70%] gap-5 h-screen">
      <div className="grid grid-rows-[0.3fr_1fr] gap-2">
        <div className="mx-2 mt-2 flex items-center justify-between">
          Overview
        
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                onClick={reCalculateBill}
                className={`
                  p-2 rounded-lg border border-gray-200 bg-white
                  transition-all
                  hover:bg-gray-50 hover:border-gray-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <RefreshCcw
                  size={16}
                />
              </button>

              {/* Tooltip */}
              <div
                className="
                  absolute right-0 mt-2 px-2 py-1 rounded-md
                  bg-gray-900 text-white text-xs whitespace-nowrap
                  opacity-0 group-hover:opacity-100
                  transition-opacity pointer-events-none
                "
              >
                Recalculate billing for this month
              </div>
            </div>
            <input
              type="month"
              value={selectedMonth}
              max={getCurrentMonth()}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5
                         text-sm text-gray-700 bg-white"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex justify-center gap-20">
          <OverviewInfoCard
            title="Total Cost"
            data={billData?.billing.total_cost}
            icon={<Receipt size={18} />}
            prefix="Rs. "
          />

          <OverviewInfoCard
            title="Average Cost / Day"
            data={billData?.billing.avg_cost_per_day}
            icon={<Calculator size={18} />}
            prefix="Rs. "
          />

          <OverviewInfoCard
            title="Most Expensive Day"
            data={billData?.billing.expensive_day_cost}
            footer={`${year}-${String(month).padStart(2, "0")}-${billData?.billing.expensive_day}`}
            icon={<CalendarDays size={18} />}
            prefix="Rs. "
          />
        </div>
      </div>

      <div className="grid grid-cols-2 grid-rows-[70%_70%] gap-4 h-screen">
        <div className="col-span-2">
          <LineGraph title="Cost per Day (Rs)" points={costPerDayPoints} />
        </div>
        <div>
          <PieGraph title="Cost Distribution by Meter (Rs)" data={costPerMeterData} />
        </div>
        <div>
          <BarGraph title="Average Cost by Weekday (Rs)" data={weekDayData} colors={COLORS} />
        </div>
      </div>
    </div>
    
    
  );
}
