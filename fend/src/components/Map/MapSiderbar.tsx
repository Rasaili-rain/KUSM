import type { Meter, MeterData } from "@/lib/types";
import { MapPin, X, AlertTriangle, Zap, Activity } from "lucide-react";
import { StatCard } from "./StatsCard";

export function MeterDetailSidebar({
  meter,
  onClose,
  isOutage,
  meterData,
  getPowerLevel,
  getVoltageStatus,
}: {
  meter: Meter | null;
  onClose: () => void;
  isOutage: (id: number) => boolean;
  meterData: MeterData | undefined;
  getPowerLevel: (id: number) => number;
  getVoltageStatus: (id: number) => string;
}) {
  if (!meter || !meterData) {
    return (
      <div className="w-96 bg-linear-to-br from-gray-50 to-white shadow-2xl border-l border-gray-200">
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Meter Selected</h3>
          <p className="text-sm text-gray-500">Click on a meter marker to view detailed information</p>
        </div>
      </div>
    );
  }

  const outage = isOutage(meter.meter_id);
  const voltageStatus = getVoltageStatus(meter.meter_id);
  const totalPower = getPowerLevel(meter.meter_id);

  return (
    <div className="w-96 bg-gradient-to-br from-white to-gray-50 shadow-2xl border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <p className="text-2xl font-bold">{meter.name}</p>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-blue-100 font-mono">SN: {meter.sn}</p>
        <p className="text-xs text-blue-200">ID: {meter.meter_id}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {outage ? (
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 text-red-700 font-bold text-lg mb-2">
              <AlertTriangle className="w-6 h-6" />
              OUTAGE DETECTED
            </div>
            <p className="text-sm text-red-600">
              No power reading available. The meter may be offline or experiencing connectivity issues.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Zap}
                label="Power"
                value={`${totalPower.toFixed(1)}kW`}
                color={totalPower > 25 ? "red" : totalPower > 18 ? "yellow" : "green"}
              />
              <StatCard
                icon={Activity}
                label="Status"
                value={voltageStatus === "normal" ? "Normal" : voltageStatus === "warning" ? "Warning" : "Critical"}
                color={voltageStatus === "normal" ? "green" : voltageStatus === "warning" ? "yellow" : "red"}
              />
            </div>

            {/* Current Data */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Zap className="w-5 h-5 text-yellow-600" />
                Current (A)
              </h3>
              <div className="space-y-3">
                {[
                  { phase: "A", value: meterData.phase_A_current, color: "bg-red-500" },
                  { phase: "B", value: meterData.phase_B_current, color: "bg-yellow-500" },
                  { phase: "C", value: meterData.phase_C_current, color: "bg-blue-500" },
                ].map(({ phase, value, color }) => (
                  <div key={phase} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Phase {phase}</span>
                      <span className="font-mono font-bold text-gray-900">{value.toFixed(2)} A</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all duration-300`}
                        style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voltage Data */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Activity className="w-5 h-5 text-green-600" />
                Voltage (V)
              </h3>
              <div className="space-y-3">
                {[
                  { phase: "A", value: meterData.phase_A_voltage, color: "bg-red-500" },
                  { phase: "B", value: meterData.phase_B_voltage, color: "bg-yellow-500" },
                  { phase: "C", value: meterData.phase_C_voltage, color: "bg-blue-500" },
                ].map(({ phase, value, color }) => (
                  <div key={phase} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Phase {phase}</span>
                      <span className="font-mono font-bold text-gray-900">{value.toFixed(2)} V</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all duration-300`}
                        style={{ width: `${((value - 180) / (250 - 180)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {voltageStatus !== "normal" && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    voltageStatus === "critical"
                      ? "bg-red-50 border border-red-200 text-red-700"
                      : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    Voltage outside normal range
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
