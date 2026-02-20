import { api } from "@/lib/api";
import type { MeterData } from "@/lib/types";
import { create } from "zustand";
import { useMeterStore } from "./meterStore";

interface LatestDataState {
  meterDataMap: { [meterId: number]: MeterData };
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;

  fetchLatestData: () => Promise<void>;
  fetchSingleMeterData: (meterId: number) => Promise<void>;
  clearLatestData: () => void;
}

export const useLatestDataStore = create<LatestDataState>((set, get) => ({
  meterDataMap: {},
  isLoading: false,
  error: null,
  lastUpdate: null,

  fetchLatestData: async () => {
    set({ isLoading: true, error: null });

    try {
      const meterIds = useMeterStore.getState().meters.map(meter => meter.meter_id);
      if (meterIds.length === 0) {
        console.warn("No meters found in meter store");
        set({ isLoading: false });
        return;
      }

      // Fetch data for all meters in parallel
      const promises = meterIds.map(id => api.meter.getLatestMeterData(id));
      const results = await Promise.allSettled(promises);

      const meterDataByMeterId: Record<number, MeterData> = {};
      
      // Process the results and populate the map
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          meterDataByMeterId[meterIds[index]] = result.value;
        } else {
          console.error(`Failed to fetch data for meter ${meterIds[index]}:`, result.reason);
        }
      });

      const timestamp = new Date().toISOString();
      set({
        meterDataMap: meterDataByMeterId,
        lastUpdate: timestamp,
        isLoading: false,
      });
      // console.log("meterDataMap Loaded", meterDataByMeterId);
    } catch (err) {
      console.error("Failed to fetch live data:", err);
      set({
        error: "Failed to load live data",
        isLoading: false,
      });
    }
  },

  fetchSingleMeterData: async (meterId: number) => {
    try {
      const data = await api.meter.getLatestMeterData(meterId);
      const currentState = get();
      // Update meter data
      const meterDataByMeterId = {
        ...currentState.meterDataMap,
        [meterId]: data,
      };
      set({
        meterDataMap: meterDataByMeterId,
        lastUpdate: new Date().toISOString(), 
      });
    } catch (err) {
      console.error(`Failed to fetch data for meter ${meterId}:`, err);
      throw err;
    }
  },

  clearLatestData: () => {
    set({
      meterDataMap: {},
      lastUpdate: null,
    });
  },
}));