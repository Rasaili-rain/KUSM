// -----------------DB types----------------

export interface Meter {
  meter_id: number;
  name: string;
  sn: string;
  x?: number | null;  // Map X coordinate (percentage)
  y?: number | null;  // Map Y coordinate (percentage)
}


// @deprecated : we do not use this type of data in the db
// below is the what we do use
export interface MeterData {
  meter_id: number;
  timestamp: string;

  phase_A_current: number;
  phase_A_voltage: number;
  phase_A_active_power: number;
  phase_A_power_factor: number;
  phase_A_grid_consumption: number;
  phase_A_exported_power: number;

  phase_B_current: number;
  phase_B_voltage: number;
  phase_B_active_power: number;
  phase_B_power_factor: number;
  phase_B_grid_consumption: number;
  phase_B_exported_power: number;

  phase_C_current: number;
  phase_C_voltage: number;
  phase_C_active_power: number;
  phase_C_power_factor: number;
  phase_C_grid_consumption: number;
  phase_C_exported_power: number;
};

// we use this kinda data for some reason ; probly export garda power ko matra aayera hola
//---------------------
export interface CurrentDataDB {
  id: number;
  meter_id: number;
  timestamp: string;
  phase_A_current: number;
  phase_B_current: number;
  phase_C_current: number;
}

export interface VoltageDataDB {
  id: number;
  meter_id: number;
  timestamp: string;
  phase_A_voltage: number;
  phase_B_voltage: number;
  phase_C_voltage: number;
}

export interface PowerDataDB {
  id: number;
  meter_id: number;
  timestamp: string;
  phase_A_active_power: number;
  phase_A_power_factor: number;
  phase_B_active_power: number;
  phase_B_power_factor: number;
  phase_C_active_power: number;
  phase_C_power_factor: number;
}

export interface EnergyDataDB {
  id: number;
  meter_id: number;
  timestamp: string;
  phase_A_grid_consumption: number;
  phase_A_exported_power: number;
  phase_B_grid_consumption: number;
  phase_B_exported_power: number;
  phase_C_grid_consumption: number;
  phase_C_exported_power: number;
};

export type MeterStatus = "NORMAL" | "ACCEPTABLE" | "WARNING" | "CRITICAL";

export interface VoltageAnalysisItem {
  meter_name: string;
  timestamp: string;

  phase_A_voltage?: number;
  phase_B_voltage?: number;
  phase_C_voltage?: number;

  voltage_unbalance_percent: number;
  status: MeterStatus;
};

export interface VoltageAnalysisResponse {
  success: boolean;
  data: VoltageAnalysisItem[];
};

export interface AvgConsumptionYearlyData {
  meter_name: string;
  year: number;
  average_power: number;
  average_energy: number;
}

export interface PreviousCurrentPowerData {
  meter_name: string;
  current_power: number | null;
  previous_power: number | null;
}
export interface AvgDailyEnergyData {
  date: string; // YYYY-MM-DD
  average_energy: number;
}
export type MonthKey =
  | "jan" | "feb" | "mar" | "apr"
  | "may" | "jun" | "jul" | "aug"
  | "sep" | "oct" | "nov" | "dec";

export interface MonthlyAverageData {
  average_current: number;
  average_voltage: number;
  average_power: number;
  average_energy: number;
}

export type MonthlyAverageDataMap = Record<MonthKey, MonthlyAverageData>;


export type VoltageStatus = "NO_DATA" | "NORMAL" | "WARNING" | "CRITICAL";

export interface VoltageAnalysisData {
  meter_name: string;
  timestamp?: string;
  phase_A_voltage?: number;
  phase_B_voltage?: number;
  phase_C_voltage?: number;
  voltage_unbalance_percent?: number;
  status: VoltageStatus;
}

export type CurrentStatus = "NO_DATA" | "NORMAL" | "WARNING" | "CRITICAL";

export interface CurrentAnalysisData {
  meter_name: string;
  timestamp?: string;
  phase_A_current?: number;
  phase_B_current?: number;
  phase_C_current?: number;
  current_unbalance_percent?: number;
  status: CurrentStatus;
}


export interface CurrentAnalysisItem {
  meter_name: string;
  timestamp: string;

  phase_A_current?: number;
  phase_B_current?: number;
  phase_C_current?: number;

  current_unbalance_percent: number;
  status: MeterStatus;
};

export interface CurrentAnalysisResponse {
  success: boolean;
  data: CurrentAnalysisItem[];
};

export interface GetAllMeterResponse {
  success: boolean;
  count: number;
  data: Meter[];
};

export type GetLatestMeterDataResponse = MeterData;

export type GetAverageConsumptionAndPowerItem = {
  meter_name: string;
  average_energy: number;
  average_power: number;
}

export type GetAverageConsumptionAndPowerResponse  = GetAverageConsumptionAndPowerItem[];

export type Billing = {
  total_cost: number;
  avg_cost_per_day: number;
  expensive_day: number;
  expensive_day_cost: number;
};

export type CostPerDay = {
  day: number;
  cost: number;
};

export type CostPerMeter = {
  meter_id: number;
  cost: number;
};

export type AvgCostPerWeekDay = {
  Sunday: number;
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
};

export type BillingResponse = {
  billing: Billing;
  cost_per_day: CostPerDay[];
  cost_per_meter: CostPerMeter[];
  avg_cost_per_weekday: AvgCostPerWeekDay;
};


// ---------------common types ------------------

export type TimePoint = {
  x: Date | number | string;
  y: number;
};



export interface GetAllMeterResponse {
  success: boolean;
  count: number;
  data: Meter[];
}

export interface MeterLocationUpdate {
  x: number;
  y: number;
}

export interface BulkLocationUpdate {
  locations: Array<{
    meter_id: number;
    x: number;
    y: number;
  }>;
}

// Prediction Types
export interface PredictionPoint {
  hour: number;
  minute: number;
  time: string;
  power_kw: number;
}

export interface DayPredictionSummary {
  min_power: number;
  max_power: number;
  avg_power: number;
  total_energy_kwh: number;
  data_points: number;
}

export interface DayPredictionResponse {
  month: number;
  day_of_week: number;
  day_name: string;
  predictions: PredictionPoint[];
  summary: DayPredictionSummary;
}

export interface SinglePredictionRequest {
  month: number;
  day_of_week: number;
  hour: number;
  minute: number;
}

export interface SinglePredictionResponse {
  power_kw: number;
  month: number;
  day_of_week: number;
  hour: number;
  minute: number;
  timestamp: string;
}

export interface ModelStats {
  mae: number;
  rmse: number;
  r2: number;
  train_samples: number;
  test_samples: number;
  power_range: {
    min: number;
    max: number;
    mean: number;
  };
  trained_at: string;
}


export interface WeekPrediction {
  [day: string]: PredictionPoint[];
}



export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    full_name: string | null;
    role: "super_admin" | "admin";
    is_active: boolean;
    created_at: string;
    created_by: number | null;
  };
}
