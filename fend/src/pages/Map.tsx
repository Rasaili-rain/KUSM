import { useState, useRef } from "react";
import { Zap, AlertTriangle, Activity, Thermometer, Pencil } from "lucide-react";
import { useMeterStore } from "@/stores/meterStore";
import type { Meter } from "@/lib/types";
import { useLatestDataStore } from "@/stores/latestDataStore";
import { StatCard } from "@/components/Map/StatsCard";
import { MapImageAndOverlays } from "@/components/Map/MapImageAndOverlays";
import { MeterDetailSidebar } from "@/components/Map/MapSiderbar";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

const VOLTAGE_LIMITS = {
  normal: { min: 200, max: 220 },
  warning: { min: 180, max: 240 },
  critical: null, // everything else
};

// Helper function to get voltage status
const getVoltageStatus = (voltage: number): "critical" | "warning" | "normal" => {
  if (voltage >= VOLTAGE_LIMITS.normal.min && voltage <= VOLTAGE_LIMITS.normal.max) return "normal";
  if (voltage >= VOLTAGE_LIMITS.warning.min && voltage <= VOLTAGE_LIMITS.warning.max) return "warning";
  return "critical";
};

export default function Map() {
  const { meters, error } = useMeterStore();
  const { meterDataMap, isLoading } = useLatestDataStore();
  const { isAuthenticated } = useAuthStore();

  const navigate = useNavigate();
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [hoveredMeter, setHoveredMeter] = useState<Meter | null>(null);
  const [activeLayers] = useState({
    markers: true,
    voltageAlerts: true,
    outages: true,
  });

  const imageRef = useRef<HTMLDivElement>(null);

  const getVoltageStatusForMeter = (meterId: number): "critical" | "warning" | "normal" => {
    const data = meterDataMap[meterId];
    if (!data) return "normal";

    const avg = (data.phase_A_voltage + data.phase_B_voltage + data.phase_C_voltage) / 3;
    return getVoltageStatus(avg);
  };

  const getPowerLevel = (meterId: number) => {
    const data = meterDataMap[meterId];
    if (!data) return 0;
    return (
      ((data.phase_A_active_power || 0) + (data.phase_B_active_power || 0) + (data.phase_C_active_power || 0)) / 1000
    );
  };

  const isOutageFn = (meterId: number): boolean => {
    const data = meterDataMap[meterId];
    if (!data) return false;
    return (
      data.phase_A_current === 0 &&
      data.phase_B_current === 0 &&
      data.phase_C_current === 0
    );
  };

  const getMarkerColor = (meter: Meter) => {
    if (activeLayers.outages && isOutageFn(meter.meter_id)) return "text-gray-600 fill-gray-300";

    if (activeLayers.voltageAlerts) {
      const status = getVoltageStatusForMeter(meter.meter_id);
      if (status === "critical") return "text-red-600 fill-red-200";
      if (status === "warning") return "text-yellow-600 fill-yellow-200";
      return "text-green-600 fill-green-200";
    }
    return selectedMeter?.meter_id === meter.meter_id ? "text-blue-600 fill-blue-200" : "text-green-600 fill-green-200";
  };

  // Calculate global statistics
  const totalPower = meters.reduce((sum, m) => sum + getPowerLevel(m.meter_id), 0);
  const activeMeters = meters.filter((m) => !isOutageFn(m.meter_id)).length;
  const criticalAlerts = meters.filter((m) => getVoltageStatusForMeter(m.meter_id) === "critical").length;

  const avgVoltage =
    meters.length > 0
      ? meters.reduce((sum, m) => {
        const data = meterDataMap[m.meter_id];
        if (!data) return sum;
        return sum + (data.phase_A_voltage + data.phase_B_voltage + data.phase_C_voltage) / 3;
      }, 0) / meters.length
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading map data...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching meter information</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
          <div className="text-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600 font-mono text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-all font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const metersWithLocation = meters.filter((m) => m.x != null && m.y != null);
  const meterId = selectedMeter?.meter_id;
  const meterData = meterId ? meterDataMap[meterId] : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-md border-b border-gray-200 p-4 shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                icon={Zap}
                label="Total Power"
                value={`${totalPower.toFixed(1)} kW`}
                color={totalPower > 100 ? "red" : totalPower > 75 ? "yellow" : "green"}
              />
              <StatCard icon={Activity} label="Active Meters" value={`${activeMeters}/${meters.length}`} color="blue" />
              <StatCard
                icon={AlertTriangle}
                label="Critical Alerts"
                value={criticalAlerts}
                color={criticalAlerts > 0 ? "red" : "green"}
              />
              <StatCard
                icon={Thermometer}
                label="Avg Voltage"
                value={`${avgVoltage.toFixed(1)} V`}
                color={
                  getVoltageStatus(avgVoltage) === "critical"
                    ? "red"
                    : getVoltageStatus(avgVoltage) === "warning"
                      ? "yellow"
                      : "green"
                }
              />
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">

              {/* Warning for no locations */}
              {metersWithLocation.length === 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 text-sm">
                    No meter locations configured. Please use the admin panel to set locations.
                  </p>
                </div>
              )}

              <div className="flex-1 flex gap-6 items-start min-h-0">
                {/* Map Container */}
                <div className="flex-1 flex items-center justify-center">
                  <MapImageAndOverlays
                    imageRef={imageRef}
                    metersWithLocation={metersWithLocation}
                    activeLayers={activeLayers}
                    selectedMeter={selectedMeter}
                    hoveredMeter={hoveredMeter}
                    setSelectedMeter={setSelectedMeter}
                    setHoveredMeter={setHoveredMeter}
                    getMarkerColor={getMarkerColor}
                    getPowerLevel={getPowerLevel}
                    getVoltageStatus={getVoltageStatusForMeter}
                    isOutage={isOutageFn}
                  />
                </div>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      navigate("/map/admin");
                    }}
                    className="ml-4 flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Map
                  </button>
                )}


              </div>
            </div>
          </div>
        </div>
      </div>
      <MeterDetailSidebar
        meter={selectedMeter}
        onClose={() => setSelectedMeter(null)}
        isOutage={isOutageFn}
        meterData={meterData}
        getPowerLevel={getPowerLevel}
        getVoltageStatus={getVoltageStatusForMeter}
      />
    </div>
  );
}
