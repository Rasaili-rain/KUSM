import type { Meter } from "@/lib/types";
import { MapPin, AlertTriangle } from "lucide-react";


export function MapImageAndOverlays({
  imageRef,
  metersWithLocation,
  activeLayers,
  selectedMeter,
  hoveredMeter,
  setSelectedMeter,
  setHoveredMeter,
  getMarkerColor,
  getPowerLevel,
  isOutage,
  getVoltageStatus,
}: any) {
  return (
    <div className="relative inline-block">
      <div ref={imageRef} className="relative border-2 border-gray-300 rounded-xl shadow-xl overflow-hidden">
        <img
          src="/KuMap.png"
          alt="Campus Map"
          className="block max-w-none"
          style={{ width: "800px", height: "600px" }}
        />

        {/* Markers */}
        {activeLayers.markers &&
          metersWithLocation.map((meter: Meter) => {
            const isOut = isOutage(meter.meter_id);
            const colorClass = getMarkerColor(meter);
            const showOutageIcon = isOut && activeLayers.outages;
            const power = getPowerLevel(meter.meter_id);
            const avgVoltage = getVoltageStatus(meter.meter_id);

            return (
              <MeterMarker
                key={meter.meter_id}
                meter={meter}
                isSelected={selectedMeter?.meter_id === meter.meter_id}
                isHovered={hoveredMeter?.meter_id === meter.meter_id}
                onClick={() => setSelectedMeter(meter)}
                onMouseEnter={() => setHoveredMeter(meter)}
                onMouseLeave={() => setHoveredMeter(null)}
                colorClass={colorClass}
                showOutageIcon={showOutageIcon}
                power={power}
                avgVoltage={avgVoltage}
                isOutageActive={isOut && activeLayers.outages}
              />
            );
          })}
      </div>
    </div>
  );
}


function MeterMarker({
  meter,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  colorClass,
  showOutageIcon,
  power,
  avgVoltage,
  isOutageActive,
}: {
  meter: Meter;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  colorClass: string;
  showOutageIcon: boolean;
  power: number;
  avgVoltage?: number;
  isOutageActive: boolean;
}) {
  const Icon = showOutageIcon ? AlertTriangle : MapPin;

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 group z-10 ${
        isSelected ? "scale-125 animate-pulse" : ""
      }`}
      style={{
        left: `${meter.x}%`,
        top: `${meter.y}%`,
      }}
    >
      <Icon className={`w-8 h-8 ${colorClass} drop-shadow-lg`} />

      {isHovered && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg shadow-2xl p-3 whitespace-nowrap z-20 min-w-48 border border-gray-700">
          <div className="font-bold mb-2 text-sm">{meter.name}</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Power:</span>
              <span className="font-semibold">{power.toFixed(1)} kW</span>
            </div>
            {avgVoltage !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Voltage:</span>
                <span className="font-semibold">{avgVoltage} V</span>
              </div>
            )}
            {isOutageActive && <div className="text-red-400 font-bold pt-1 border-t border-gray-700">⚠ OUTAGE</div>}
          </div>
        </div>
      )}
    </button>
  );
}
