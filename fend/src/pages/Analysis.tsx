import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { UnbalanceCard } from "@components/UnbalanceCard";
import type { VoltageAnalysisItem, CurrentAnalysisItem } from "@/lib/types";

export default function Analysis() {
  const [voltageItems, setVoltageItems] = useState<VoltageAnalysisItem[]>([]);
  const [currentItems, setCurrentItems] = useState<CurrentAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [voltageRes, currentRes] = await Promise.all([
          api.analysis.getVoltageAnalysis(),
          api.analysis.getCurrentAnalysis(),
        ]);

        setVoltageItems(voltageRes.data);
        setCurrentItems(currentRes.data);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 16 }}>

      <h1 style={{fontWeight: "bold", padding: 8}}>Voltage Unbalance</h1>
      <div style={gridStyle}>
        {voltageItems.map((item) => (
          <UnbalanceCard key={"V-" + item.meter_name + item.timestamp} mode="voltage" data={item} />
        ))}
      </div>

      <h2 style={{ fontWeight: "bold", marginTop: 24, padding: 8 }}>Current Unbalance</h2>
      <div style={gridStyle}>
        {currentItems.map((item) => (
          <UnbalanceCard key={"C-" + item.meter_name + item.timestamp} mode="current" data={item} />
        ))}
      </div>
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
  gap: 16,
};
