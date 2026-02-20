import { axiosInstance } from "./api_provider";
import type { AvgConsumptionYearlyData, AvgDailyEnergyData, CurrentAnalysisResponse, DayPredictionResponse, GetAllMeterResponse, LoginResponse, MeterData, ModelStats, PreviousCurrentPowerData, SinglePredictionRequest, SinglePredictionResponse, VoltageAnalysisResponse, WeekPrediction } from "./types";

// API methods
export const api = {
  system: {
    async healthCheck(): Promise<boolean> {
      const res = await axiosInstance.get("/");
      return res.status === 200; ``
    },
  },

  auth: {
    async login(email: string, password: string): Promise<LoginResponse> {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    },

    // Profile management
    updateProfile: async (data: { full_name: string }) => {
      const response = await axiosInstance.patch('/auth/me', data);
      return response.data;
    },

    changePassword: async (data: { old_password: string; new_password: string }) => {
      const response = await axiosInstance.post('/auth/me/change-password', data);
      return response.data;
    },

    // Super admin methods
    updateUserProfile: async (userId: number, data: { full_name: string }) => {
      const response = await axiosInstance.patch(`/auth/users/${userId}`, data);
      return response.data;
    },

    resetUserPassword: async (userId: number, data: { new_password: string }) => {
      const response = await axiosInstance.post(`/auth/users/${userId}/reset-password`, data);
      return response.data;
    },
  },

  meter: {
    async getAllMeter(): Promise<GetAllMeterResponse> {
      const response = await axiosInstance.get("/meter");
      return response.data;
    },

    async getLatestMeterData(id: number): Promise<MeterData> {
      const response = await axiosInstance.get(`/meter/${id}/latest`);
      return response.data;
    },

    async updateMeterLocation(meterId: number, location: { x: number; y: number }) {
      const response = await axiosInstance.put(`/meter/${meterId}/location`, location);
      return response.data;
    },

    async updateMeterLocations(locations: Array<{ meter_id: number; x: number; y: number }>) {
      const response = await axiosInstance.put(`/meter/edit/locations`, { locations });
      return response.data;
    },

    async getMeterDataByDate(name: string, fromDate: string, toDate: string) {
      const response = await axiosInstance.get(`/meter/databydate`, {
        params: {
          meter_name: name,
          from_date: fromDate,
          to_date: toDate,
        },
      });
      return response.data;
    },

    async getAvgDailyEnergy(fromDate: string, toDate: string): Promise<AvgDailyEnergyData[]> {
      const response = await axiosInstance.get(`/analysis/avg_daily_energy`, {
        params: {
          from_date: fromDate,
          to_date: toDate,
        }
      });

      return response.data;
    },

    async getAverageConsumptionAndPowerYearly(year: number): Promise<AvgConsumptionYearlyData[]> {
      const response = await axiosInstance.get("/analysis/avg_consumption_yearly", {
        params: {
          year: year
        }
      });
      return response.data
    },

    async getPreviousCurrentPower(): Promise<PreviousCurrentPowerData[]> {
      const response = await axiosInstance.get("/analysis/prev_curr_power");
      return response.data;
    }
  },

  analysis: {
    async getVoltageAnalysis(): Promise<VoltageAnalysisResponse> {
      const response = await axiosInstance.get("/analysis/voltage");
      return response.data;
    },

    async getCurrentAnalysis(): Promise<CurrentAnalysisResponse> {
      const response = await axiosInstance.get("/analysis/current");
      return response.data;
    },
  },

  billing: {
    async getBillingData(year: number, month: number) {
      const response = await axiosInstance.get(`/billing/${year}/${month}`);
      return response.data;
    },

    async doBill(year: number, month: number) {
      const response = await axiosInstance.post(`/billing/${year}/${month}`);
      return response.data;
    }
  },


  prediction: {

    async getModelStats(): Promise<ModelStats> {
      const response = await axiosInstance.get("api/prediction/stats");
      return response.data;
    },
    async getSinglePrediction(params: SinglePredictionRequest): Promise<SinglePredictionResponse> {
      const response = await axiosInstance.post("api/prediction/single", params);
      return response.data;
    },

    async getDayPrediction(month: number, dayOfWeek: number, intervalMinutes: number = 5): Promise<DayPredictionResponse> {
      const response = await axiosInstance.post("api/prediction/day", {
        month,
        day_of_week: dayOfWeek,
        interval_minutes: intervalMinutes,
      });
      return response.data;
    },

    async getWeekPrediction(month: number, startDay: number = 0): Promise<{ week_predictions: WeekPrediction; summary: any }> {
      const response = await axiosInstance.post("api/prediction/week", {
        month,
        start_day: startDay,
      });
      return response.data;
    },
  },

};

export default axiosInstance;
