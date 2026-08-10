import { useState } from "react";
import { Plus, Trash2, Percent } from "lucide-react";
import { Badge, Button, Card } from "./ui";
import {
  computeMarksTotals,
  GRADE_COLORS,
  gradeForMarks,
  validateMarksRow,
} from "../utils/grading";

let rowId = 0;
const blankRow = () => ({
  _id: `row-${rowId++}`,
  name: "",
  scored: "",
  max: "100",
});

export default function MarksCalculator() {
  const [rows, setRows] = useState([blankRow(), blankRow(), blankRow()]);

  const updateRow = (index, patch) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };
  const addRow = () => setRows((prev) => [...prev, blankRow()]);
  const deleteRow = (index) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const totals = computeMarksTotals(rows);

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "2px",
            }}
          >
            <Percent size={15} color="var(--indigo-400)" />
            <span
              style={{
                fontWeight: 700,
                fontSize: "15px",
                color: "var(--text-primary)",
              }}
            >
              Marks Scored Calculator
            </span>
            <Badge color="var(--indigo-400)">Signed-in feature</Badge>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Enter marks per subject to get your total and percentage.
          </p>
        </div>
      </div>

      <div style={{ padding: "4px 24px 0" }}>
        {rows.map((row, i) => {
          const errors = validateMarksRow(row);
          const grade =
            row.scored !== "" && !isNaN(parseFloat(row.scored))
              ? gradeForMarks(row.scored)
              : null;
          return (
            <div
              key={row._id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px 100px 70px 36px",
                gap: "10px",
                alignItems: "start",
                padding: "10px 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {i === 0 && (
                <>
                  <span style={labelStyle}>Subject</span>
                  <span style={labelStyle}>Scored</span>
                  <span style={labelStyle}>Max</span>
                  <span style={labelStyle}>Grade</span>
                  <span />
                </>
              )}
              {i !== 0 && <div />}
              <input
                type="text"
                placeholder={`Subject ${i + 1}`}
                value={row.name}
                onChange={(e) => updateRow(i, { name: e.target.value })}
                style={inputStyle()}
              />
              <input
                type="number"
                min="0"
                placeholder="0"
                value={row.scored}
                onChange={(e) => updateRow(i, { scored: e.target.value })}
                style={inputStyle(errors.scored)}
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={row.max}
                onChange={(e) => updateRow(i, { max: e.target.value })}
                style={inputStyle(errors.max)}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "35px",
                }}
              >
                {grade && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: GRADE_COLORS[grade],
                    }}
                  >
                    {grade}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => deleteRow(i)}
                title="Remove"
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={13} />
              </button>
              {(errors.scored || errors.max) && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    fontSize: "11px",
                    color: "var(--red-500)",
                    marginTop: "-4px",
                  }}
                >
                  {errors.scored ?? errors.max}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={addRow}
          style={{ color: "var(--indigo-400)" }}
        >
          <Plus size={15} /> Add Subject
        </Button>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <Stat label="Marks Scored" value={totals.scored} />
          <Stat label="Maximum Marks" value={totals.max} />
          <Stat
            label="Percentage"
            value={`${totals.percentage.toFixed(2)}%`}
            highlight
          />
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value, highlight = false }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "18px",
          fontWeight: 700,
          color: highlight ? "var(--emerald-400)" : "var(--text-primary)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--text-muted)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};
function inputStyle(hasError) {
  return {
    background: "var(--bg-input)",
    border: `1px solid ${hasError ? "var(--red-500)" : "var(--border)"}`,
    borderRadius: "var(--radius-md)",
    padding: "8px 10px",
    fontSize: "14px",
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
    outline: "none",
    width: "100%",
  };
}
