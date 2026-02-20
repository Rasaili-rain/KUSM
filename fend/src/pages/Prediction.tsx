import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DayPredictionResponse, ModelStats } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", 
  "Friday", "Saturday", "Sunday"
];

export default function Prediction() {
  const [prediction, setPrediction] = useState<DayPredictionResponse | null>(null);
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [intervalMinutes, setIntervalMinutes] = useState(60);

  useEffect(() => {
    loadModelStats();
  }, []);

  const loadModelStats = async () => {
    try {
      const statsData = await api.prediction.getModelStats();
      setStats(statsData);
    } catch (e: any) {
      console.error("Failed to load model stats:", e);
    }
  };

  const loadPrediction = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.prediction.getDayPrediction(
        selectedMonth,
        selectedDay,
        intervalMinutes
      );

      setPrediction(data);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.detail || e?.message || "Failed to load prediction");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrediction();
  }, [selectedMonth, selectedDay, intervalMinutes]);

  // Simple SVG Chart
  const renderChart = () => {
    if (!prediction) return null;

    const data = prediction.predictions;
    const maxPower = Math.max(...data.map(p => p.power_kw));
    const minPower = Math.min(...data.map(p => p.power_kw));
    const range = maxPower - minPower;
    const padding = range * 0.1;

    const chartWidth = 1000;
    const chartHeight = 300;
    const points = data.map((point, idx) => {
      const x = (idx / (data.length - 1)) * chartWidth;
      const normalized = (point.power_kw - minPower + padding) / (range + 2 * padding);
      const y = chartHeight - (normalized * chartHeight);
      return { x, y, ...point };
    });

    const pathData = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
    ).join(' ');

    const areaData = `${pathData} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

    // Y-axis labels
    const yLabels = [
      maxPower + padding,
      (maxPower + minPower) / 2,
      minPower - padding
    ];

    return (
      <div style={{ backgroundColor: "white", padding: 20, borderRadius: 8, border: "1px solid #e5e7eb" }}>
        <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: "600" }}>
          24-Hour Power Prediction: {MONTHS[selectedMonth - 1]}, {DAYS[selectedDay]}
        </h3>
        <div style={{ position: "relative" }}>
          {/* Y-axis labels */}
          <div style={{ position: "absolute", left: -60, top: 0, height: 400, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
            {yLabels.map((label, i) => (
              <div key={i}>{label.toFixed(0)} kW</div>
            ))}
          </div>

          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            style={{ width: "100%", height: "100%", maxHeight: 400, display: "block" }}
          >
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1={0}
                y1={i * chartHeight / 4}
                x2={chartWidth}
                y2={i * chartHeight / 4}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}

            {/* Area fill */}
            <path
              d={areaData}
              fill="rgba(59, 130, 246, 0.1)"
            />

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth={2}
            />

            {/* Points (only if not too many) */}
            {points.length <= 50 && points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill="rgb(59, 130, 246)"
                  style={{ cursor: "pointer" }}
                />
                <title>{p.time}: {p.power_kw.toFixed(2)} kW</title>
              </g>
            ))}
          </svg>

          {/* X-axis labels */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"].map((time, i) => (
              <div key={i}>{time}</div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !prediction) {
    return (
      <div style={{ padding: 16 }}>
        <p>Loading prediction...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontWeight: "bold", marginBottom: 24 }}>
        Power Prediction
      </h1>

      {/* Model Stats Card */}
      {stats && (
        <div style={{
          backgroundColor: "#f9fafb",
          padding: 20,
          borderRadius: 8,
          marginBottom: 24,
          border: "1px solid #e5e7eb",
        }}>
          <h3 style={{ marginBottom: 12, fontSize: 18, fontWeight: "600" }}>
            Model Performance
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            <StatItem label="R² Score" value={stats.r2.toFixed(4)} />
            <StatItem label="MAE" value={`${stats.mae.toFixed(2)} kW`} />
            <StatItem label="RMSE" value={`${stats.rmse.toFixed(2)} kW`} />
            <StatItem label="Power Range" value={`${stats.power_range.min.toFixed(1)} - ${stats.power_range.max.toFixed(1)} kW`} />
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 24,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>Month</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 14,
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            {MONTHS.map((month, idx) => (
              <option key={month} value={idx + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>Day of Week</label>
          <select 
            value={selectedDay} 
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 14,
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            {DAYS.map((day, idx) => (
              <option key={day} value={idx}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>Interval</label>
          <select 
            value={intervalMinutes} 
            onChange={(e) => setIntervalMinutes(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 14,
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            <option value={5}>5 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: 16,
          backgroundColor: "#fef2f2",
          color: "#dc2626",
          borderRadius: 8,
          marginBottom: 24,
          border: "1px solid #fecaca",
        }}>
          {error}
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <p>Loading prediction...</p>
        </div>
      ) : prediction ? (
        <>
          {renderChart()}

          {/* Summary Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}>
            <SummaryCard 
              title="Minimum Power" 
              value={`${prediction.summary.min_power} kW`}
              color="#10b981"
            />
            <SummaryCard 
              title="Maximum Power" 
              value={`${prediction.summary.max_power} kW`}
              color="#ef4444"
            />
            <SummaryCard 
              title="Average Power" 
              value={`${prediction.summary.avg_power} kW`}
              color="#3b82f6"
            />
            <SummaryCard 
              title="Total Energy" 
              value={`${prediction.summary.total_energy_kwh.toFixed(2)} kWh`}
              color="#f59e0b"
            />
          </div>

          {/* Data Table */}
          <div style={{
            marginTop: 24,
            backgroundColor: "white",
            padding: 20,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: "600" }}>
              Prediction Details
            </h3>
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              <table style={{ width: "100%", fontSize: 14 }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>Time</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", borderBottom: "2px solid #e5e7eb" }}>Power (kW)</th>
                  </tr>
                </thead>
                <tbody>
                  {prediction.predictions.map((point, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "8px 12px" }}>{point.time}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: "500" }}>
                        {point.power_kw.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// Helper Components
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: "600" }}>
        {value}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{
      backgroundColor: "white",
      padding: 20,
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: "bold", color }}>
        {value}
      </div>
    </div>
  );
}