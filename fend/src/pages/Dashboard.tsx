import { useEffect, useState, useMemo } from "react";

import {
  EnergyMap,
  type EnergyMapValue
} from "@components/EnergyMap";
import {
  PowerTable,
  type MeterPowerRow,
} from "@components/PowerTable";
import {
  PieGraph,
  type PieGraphPoint,
} from "@components/PieGraph";
import { api } from "@/lib/api";
import { getColorByID, getYearRange } from "@/lib/utils";


export default function Dashboard() {
  const [energyMapData, setEnergyMapData] = useState<EnergyMapValue[] | null>(null);
  const [powerTable, setPowerTable] = useState<MeterPowerRow[] | null>(null);
  const [meterEnergy, setMeterEnergy] = useState<PieGraphPoint[] | null>(null);

  const currentYear = new Date().getFullYear();
  const { start, end } = useMemo(() => getYearRange(), []);
  const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    api.meter
      .getAvgDailyEnergy(start, end)
      .then((energyData) => {
        setEnergyMapData(
          energyData.map((d: { date: any; average_energy: any; }) => ({
            date: d.date,
            count: d.average_energy,
          }))
        );
      })
  }, [start, end]);

  useEffect(() => {
    api.meter
      .getAverageConsumptionAndPowerYearly(currentYear)
      .then((resData) => {
        const points = resData.map((item: { meter_name: any; average_power: any; }, index: string | number) => ({
          id: index,
          label: item.meter_name,
          value: item.average_power,
          color: getColorByID(index),
        }));

        setMeterEnergy(points);
      });
  }, [currentYear]);

  useEffect(() => {
    const fetchPower = async () => {
      const res = await api.meter.getPreviousCurrentPower();
      const rows = res.map((m) => {
        const currentPower = m.current_power ?? 0;
        const previousPower = m.previous_power ?? 0;
        const diff = currentPower - previousPower;
        const percent = previousPower === 0 ? 0 : (diff / previousPower) * 100;

        return {
          meter_name: m.meter_name,
          power: currentPower,
          deltaPercent: +percent.toFixed(1),
          trend: diff > 0 ? "up" : diff < 0 ? "down" : "same",
        } as const;
      });

      setPowerTable(rows);
    };

    fetchPower();
    const id = setInterval(fetchPower, POLL_INTERVAL);

    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <div className="grid grid-rows-2 gap-2">
      <div className="grid grid-cols-2 gap-2">
        <PowerTable data={powerTable} />
    
        <PieGraph
          title="Average Energy Distribution Across Meters (Wh)"
          data={meterEnergy}
          innerRadius={60}
          outerRadius={150}
        />
      </div>
      <EnergyMap
        title="Energy Consumption this Year"
        data={energyMapData}
        colors={[
          "#f5f3ff",
          "#ddd6fe",
          "#a78bfa",
          "#7c3aed",
          "#4c1d95",
        ]}
        start_date={start}
        end_date={end}
      />
    </div>
  );
}
