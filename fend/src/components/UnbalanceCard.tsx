import React from "react";
import type { MeterStatus, VoltageAnalysisItem, CurrentAnalysisItem } from "@/lib/types";

type Mode = "voltage" | "current";

type Props = {
  mode: Mode;
  data: VoltageAnalysisItem | CurrentAnalysisItem;
};

const getStatusStyle = (status: MeterStatus) => {
  switch (status) {
    case "NORMAL":
      return { fg: "#166534", bg: "#dcfce7", dot: "#22c55e" };
    case "ACCEPTABLE":
      return { fg: "#14532d", bg: "#ecfccb", dot: "#84cc16" };
    case "WARNING":
      return { fg: "#92400e", bg: "#ffedd5", dot: "#f59e0b" };
    case "CRITICAL":
      return { fg: "#991b1b", bg: "#fee2e2", dot: "#ef4444" };
    default:
      return { fg: "#374151", bg: "#f3f4f6", dot: "#9ca3af" };
  }
};

const SparkIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 17l6-6 4 4 6-8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 20h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const UnbalanceCard: React.FC<Props> = ({ mode, data }) => {
  const value =
    mode === "voltage"
      ? (data as VoltageAnalysisItem).voltage_unbalance_percent
      : (data as CurrentAnalysisItem).current_unbalance_percent;

  const val = typeof value === "number" ? value.toFixed(2) : "--";
  const label = mode === "voltage" ? "Voltage Unbalance" : "Current Unbalance";
  const s = getStatusStyle(data.status);

  const ts = data.timestamp ? new Date(data.timestamp) : null;

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div style={styles.labelBlock}>
          <div style={styles.subLabel}>{data.meter_name}</div>
        </div>

        <div style={styles.iconChip} title={label}>
          <span style={styles.iconChipInner}>
            <SparkIcon />
          </span>
        </div>
      </div>

      <div style={styles.valueRow}>
        <div style={styles.value}>
          {val}
          <span style={styles.unit}>%</span>
        </div>

        <div style={{ ...styles.statusPill, backgroundColor: s.bg, color: s.fg }}>
          <span style={{ ...styles.statusDot, backgroundColor: s.dot }} />
          {data.status}
        </div>
      </div>

      <div style={styles.footer}>
        <span style={styles.footerKey}>Last updated</span>
        <span style={styles.footerVal}>
          {ts ? ts.toLocaleString() : "--"}
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: 360,
    padding: 20,
    borderRadius: 16,
    background: "rgba(239, 246, 255, 0.85)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",

    border: "1px solid rgba(59, 130, 246, 0.08)",

    boxShadow: "0 1px 2px 2px rgba(15, 23, 42, 0.04)",

    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  labelBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
  },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#6b7280",
    letterSpacing: "0.2px",
  },

  subLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 260,
  },

  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  iconChipInner: {
    color: "#111827",
    display: "grid",
    placeItems: "center",
  },

  valueRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
  },

  value: {
    fontSize: 35,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.05,
    letterSpacing: "-0.6px",
  },

  unit: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    marginLeft: 6,
  },

  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    display: "inline-block",
  },

  footer: {
    marginTop: 18,
    paddingTop: 12,
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 12,
  },

  footerKey: {
    color: "#9ca3af",
    fontWeight: 600,
  },

  footerVal: {
    color: "#6b7280",
    fontWeight: 600,
    textAlign: "right",
  },
};
