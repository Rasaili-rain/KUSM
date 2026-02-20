import { useMeterStore } from "@/stores/meterStore";
import type { Meter } from "@/lib/types";
import { Trash2, Save, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast"; 

export default function MapAdmin() {
  const { meters, isLoading, error, fetchMeters, updateMeterLocations } = useMeterStore();
  const [localMeters, setLocalMeters] = useState<Meter[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);

  useEffect(() => {
    // Initialize local state with fetched meters
    setLocalMeters(meters.map(m => ({
      ...m,
      x: m.x ?? 50, // Default to center if no position
      y: m.y ?? 50
    })));
  }, [meters]);

  const handleImageClick = (e: { clientX: number; clientY: number; }) => {
    if (!selectedMeter || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setLocalMeters(
      localMeters.map((m) =>
        m.meter_id === selectedMeter.meter_id
          ? { ...m, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
          : m
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const locations = localMeters.map(m => ({
        meter_id: m.meter_id,
        x: m.x ?? 50,
        y: m.y ?? 50
      }));

      await updateMeterLocations(locations);
      
      toast.success("Locations saved successfully!");
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to save locations:", err);
      toast.error("Failed to save locations. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalMeters(meters.map(m => ({
      ...m,
      x: m.x ?? 50,
      y: m.y ?? 50
    })));
    setHasChanges(false);
    setSelectedMeter(null);
  };

  if (isLoading && localMeters.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading meters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Map Container */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Map Editor (Admin)</h1>
            <div className="flex gap-2">
              {hasChanges && (
                <>
                  <button
                    onClick={handleReset}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 
                             flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                             flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Select a location from the list, then click on the map to position it.
          </p>

          <div
            ref={imageRef}
            onClick={handleImageClick}
            className="relative inline-block cursor-crosshair border-2 border-gray-300 rounded"
          >
            <img
              src="/KuMap.png"
              alt="Campus Map"
              className="block max-w-none pointer-events-none"
              style={{ width: "800px", height: "600px" }}
            />

            {/* Markers */}
            {localMeters.map((meter) => (
              <div
                key={meter.meter_id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${meter.x}%`,
                  top: `${meter.y}%`,
                }}
              >
                <MapPin
                  className={`w-8 h-8 ${
                    selectedMeter?.meter_id === meter.meter_id
                      ? "text-blue-600 fill-blue-200"
                      : "text-red-600 fill-red-200"
                  } drop-shadow-lg`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar with meter list */}
      <div className="w-96 bg-white shadow-lg p-6 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Locations</h2>

        <div className="space-y-2">
          {localMeters.map((meter) => (
            <button
              key={meter.meter_id}
              onClick={() => setSelectedMeter(meter)}
              className={`w-full text-left p-3 rounded border-2 transition-colors ${
                selectedMeter?.meter_id === meter.meter_id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="font-semibold">{meter.name}</div>
              <div className="text-sm text-gray-600 font-mono">{meter.sn}</div>
              <div className="text-xs text-gray-500 mt-1">
                Position: ({(meter.x ?? 50).toFixed(1)}%, {(meter.y ?? 50).toFixed(1)}%)
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}