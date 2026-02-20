import { create } from "zustand";
import { api } from "@/lib/api";
import type { Meter, GetAllMeterResponse } from "@/lib/types";

interface MeterLocation {
  meter_id: number;
  x: number;
  y: number;
}

interface MeterState {
  meters: Meter[];
  isLoading: boolean;
  error: string | null;

  fetchMeters: () => Promise<void>;
  clearMeters: () => void;
  updateMeterLocation: (meterId: number, x: number, y: number) => Promise<void>;
  updateMeterLocations: (locations: MeterLocation[]) => Promise<void>;
}

export const useMeterStore = create<MeterState>((set, get) => ({
  meters: [],
  isLoading: false,
  error: null,

  fetchMeters: async () => {
    set({ isLoading: true, error: null });

    try {
      const res: GetAllMeterResponse = await api.meter.getAllMeter();
      set({
        meters: res.data,
        isLoading: false,
      });
      console.log ("meter loaded with data :",res.data);
    } catch (err) {
      console.error("Failed to fetch meters:", err);
      set({
        error: "Failed to load meters",
        isLoading: false,
      });
    }
  },

  updateMeterLocation: async (meterId: number, x: number, y: number) => {
    set({ isLoading: true, error: null });

    try {
      await api.meter.updateMeterLocation(meterId, { x, y });
      
      // Update local state
      const meters = get().meters.map((meter) =>
        meter.meter_id === meterId ? { ...meter, x, y } : meter
      );
      
      set({ meters, isLoading: false });
      console.log(`Updated location for meter ${meterId}:`, { x, y });
    } catch (err) {
      console.error("Failed to update meter location:", err);
      set({
        error: "Failed to update meter location",
        isLoading: false,
      });
      throw err;
    }
  },

  updateMeterLocations: async (locations: MeterLocation[]) => {
    set({ isLoading: true, error: null });

    try {
      await api.meter.updateMeterLocations(locations);
      
      // Update local state for all meters
      const meters = get().meters.map((meter) => {
        const location = locations.find((loc) => loc.meter_id === meter.meter_id);
        return location ? { ...meter, x: location.x, y: location.y } : meter;
      });
      
      set({ meters, isLoading: false });
      console.log("Updated locations for multiple meters:", locations);
    } catch (err) {
      console.error("Failed to update meter locations:", err);
      set({
        error: "Failed to update meter locations",
        isLoading: false,
      });
      throw err;
    }
  },

  clearMeters: () => {
    set({ meters: [] });
  },
}));
