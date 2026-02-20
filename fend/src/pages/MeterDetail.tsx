import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Zap,
  Gauge,
  Activity,
  Plug
} from "lucide-react";

type PhaseMetric =
  | "current"
  | "voltage"
  | "active_power"
  | "power_factor"
  | "grid_consumption"
  | "exported_power";

type PhaseKey =
  | `phase_A_${PhaseMetric}`
  | `phase_B_${PhaseMetric}`
  | `phase_C_${PhaseMetric}`;


import { useMeterStore } from "@stores/meterStore";
import type { MeterData, TimePoint } from "@/lib/types";
import { api } from "@/lib/api";
import { getToday } from "@/lib/utils";
import { LineGraph } from "@components/LineGraph";
import { BarGraph } from "@components/BarGraph";
import { OverviewInfoCard } from "@components/OverviewInfoCard";
import { useLatestDataStore } from "@/stores/latestDataStore";

export default function MeterDetail() {
  const { meterId } = useParams<{ meterId: string }>();
  const meters = useMeterStore((s) => s.meters);
  const { meterDataMap } = useLatestDataStore();
  const meter = meters.find((m) => m.meter_id === Number(meterId));

  const [meterReadings, setMeterReadings] = useState<MeterData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(getToday());


  // Creates line graph plotable data
  const createPhaseData = (keyPrefix: string) => {
    if (meterReadings === null) return null;

    const a: TimePoint[] = [];
    const b: TimePoint[] = [];
    const c: TimePoint[] = [];
    let totalSum = 0;
    let count = 0;

    meterReadings.forEach(d => {
      const time = new Date(d.timestamp.replace(" ", "T"));

      const valA = d[`phase_A_${keyPrefix}` as PhaseKey];
      const valB = d[`phase_B_${keyPrefix}` as PhaseKey];
      const valC = d[`phase_C_${keyPrefix}` as PhaseKey];
      a.push({ x: time, y: valA });
      b.push({ x: time, y: valB });
      c.push({ x: time, y: valC });

      totalSum += valA + valB + valC;
      count += 3;
    });

    // Returning null if no data is found (to trigger the loading animation ofc)
    // if (!a.length && !b.length && !c.length) return null;

    const phaseData = [
      { label: "Phase A", data: a, color: "#6D28D9" },
      { label: "Phase B", data: b, color: "#0D9488" },
      { label: "Phase C", data: c, color: "#D97706" },
    ];

    const average = count > 0 ? totalSum / count : 0;

    return { phaseData: phaseData, average: average.toFixed(2) };
  };

  // Fetch the meter data
  useEffect(() => {
    if (!meter) return;

    setLoading(true);
    setMeterReadings(null);

    const fetchDataForDate = async () => {
      try {
        const res = await api.meter.getMeterDataByDate(
          meter.name,
          selectedDate,
          selectedDate
        );

        if (!res.success) {
          throw new Error(res.message);
        }

        setMeterReadings(res.data);
      } catch (err) {
        // console.error(err);
        setMeterReadings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDataForDate();
  }, [meter, selectedDate]);


  useEffect(() => {
    if (!meter) return;
    const isToday = selectedDate === getToday();
    if (!isToday) return;
    const latestData = meterDataMap[meter.meter_id];
    if (!latestData) return;

    setMeterReadings((prev) => {
      // Handle null or empty array
      if (!prev || prev.length === 0) return [latestData];

      const last = prev[prev.length - 1];
      if (last.timestamp === latestData.timestamp) {
        return prev;
      }

      // Add new reading and keep last 288 readings (24 hours at 5 min intervals)
      return [...prev, latestData].slice(-288);
    });
  }, [meter, selectedDate, meterDataMap]);

  const powerData = useMemo(() => createPhaseData('active_power'), [meterReadings]);
  const currentData = useMemo(() => createPhaseData('current'), [meterReadings]);
  const voltageData = useMemo(() => createPhaseData('voltage'), [meterReadings]);
  const gridData = useMemo(() => createPhaseData('grid_consumption'), [meterReadings]);

  const phasePowerContribution = useMemo(() => {
    if (meterReadings === null) return null;

    let sumA = 0;
    let sumB = 0;
    let sumC = 0;

    meterReadings.forEach(d => {
      sumA += d.phase_A_active_power;
      sumB += d.phase_B_active_power;
      sumC += d.phase_C_active_power;
    });

    const total = sumA + sumB + sumC;
    if (total === 0) return [];

    return [
      { label: "Phase A", value: +(sumA / total * 100).toFixed(1) },
      { label: "Phase B", value: +(sumB / total * 100).toFixed(1) },
      { label: "Phase C", value: +(sumC / total * 100).toFixed(1) },
    ];
  }, [meterReadings]);

  return (
    <div className="grid grid-rows-2 grid-rows-[30%_70%] gap-2 h-screen">
      <div className="grid grid-rows-[0.3fr_1fr] gap-2">
        <div className="mx-2 mt-2 text-xl flex items-center justify-between">
          Overview
          <input
            type="date"
            value={selectedDate}
            max={getToday()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5
                       text-sm text-gray-700 bg-white"

            disabled={loading}
          />
        </div>
        <div className="grid grid-cols-4 auto-cols-fr gap-3">
          <OverviewInfoCard
            title="Power"
            data={powerData?.average ? Number(powerData.average) : undefined}
            unit="W"
            icon={<Zap size={18} />}
          />

          <OverviewInfoCard
            title="Grid Consumption"
            data={gridData?.average ? Number(gridData.average) : undefined}
            unit="Wh"
            icon={<Plug size={18} />}
          />

          <OverviewInfoCard
            title="Current"
            data={currentData?.average ? Number(currentData.average) : undefined}
            unit="A"
            icon={<Activity size={18} />}
          />

          <OverviewInfoCard
            title="Voltage"
            data={voltageData?.average ? Number(voltageData.average) : undefined}
            unit="V"
            icon={<Gauge size={18} />}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 grid-rows-[70%_40%_40%] gap-4 h-screen">
        <div className="col-span-2">
          <LineGraph title="Power (W)" points={powerData?.phaseData} />
        </div>
        <div className="">
          <LineGraph title="Current (A)" points={currentData?.phaseData} />
        </div>
        <div className="row-span-2">
          <BarGraph
            title="Phase Power Contribution (%)"
            data={phasePowerContribution}
            colors={["#6D28D9", "#0D9488", "#D97706"]}
          />
        </div>
        <div className="">
          <LineGraph title="Voltage (V)" points={voltageData?.phaseData} />
        </div>
      </div>
    </div>
  );
}
