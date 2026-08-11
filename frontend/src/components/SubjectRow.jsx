import { Trash2 } from "lucide-react";
import {
  GRADE_COLORS,
  GRADE_LABELS,
  gradeForMarks,
  VALID_GRADES,
} from "../utils/grading";
import SubjectAutocomplete from "./SubjectAutocomplete";

export default function SubjectRow({
  subject,
  index,
  onChange,
  onDelete,
  error = {},
  authenticated = false,
  courseSubjects = [],
}) {
  const gradeColor = GRADE_COLORS[subject.grade] ?? "var(--text-secondary)";
  const inputBase = {
    background: "var(--bg-input)",
    borderRadius: "var(--radius-md)",
    padding: "8px 10px",
    fontSize: "14px",
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
    outline: "none",
    width: "100%",
  };

  const colLabel = {
    fontSize: "11px",
    fontWeight: 500,
    color: "var(--text-muted)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  };

  const handleMarkChange = (rawValue) => {
    const patch = { ...subject, mark: rawValue };
    const parsed = parseFloat(rawValue);
    if (rawValue !== "" && !isNaN(parsed)) patch.grade = gradeForMarks(parsed);
    onChange(patch);
  };

  const handleSubjectSelect = (matched) => {
    onChange({
      ...subject,
      code: matched.code,
      name: matched.name,
      credits: matched.credits,
    });
  };

  const gridColumns = authenticated
    ? "1fr 90px 90px 140px 36px"
    : "1fr 100px 140px 36px";

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: "10px",
        alignItems: "start",
        padding: "10px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Column: Subject Name */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {index === 0 && <span style={colLabel}>Subject Name</span>}
        {authenticated ? (
          <>
            <SubjectAutocomplete
              value={subject.name}
              onInputChange={(val) =>
                onChange({ ...subject, name: val, code: "" })
              }
              onSelect={handleSubjectSelect}
              subjects={courseSubjects}
              placeholder={`Subject ${index + 1}`}
              error={error.name}
            />
            {subject.code && (
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--indigo-400)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {subject.code} · matched
              </span>
            )}
            {!subject.code && subject.name && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Not found in course structure — entering manually
              </span>
            )}
          </>
        ) : (
          <input
            type="text"
            placeholder={`Subject ${index + 1}`}
            value={subject.name}
            onChange={(e) => onChange({ ...subject, name: e.target.value })}
            maxLength={75}
            style={{
              ...inputBase,
              border: `1px solid ${error.name ? "var(--red-500)" : "var(--border)"}`,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--border-focus)";
              e.target.style.boxShadow = "var(--shadow-indigo)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error.name
                ? "var(--red-500)"
                : "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        )}
        {error.name && (
          <span style={{ fontSize: "11px", color: "var(--red-500)" }}>
            {error.name}
          </span>
        )}
      </div>

      {/* Column: Marks (authenticated only) */}
      {authenticated && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {index === 0 && <span style={colLabel}>Mark</span>}
          <div style={{ position: "relative" }}>
            <input
              type="number"
              placeholder="—"
              min="0"
              max="100"
              step="1"
              value={subject.mark ?? ""}
              onChange={(e) => handleMarkChange(e.target.value)}
              style={{
                ...inputBase,
                fontFamily: "var(--font-mono)",
                textAlign: "center",
              }}
            />
          </div>
        </div>
      )}

      {/* Column: Credits */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {index === 0 && <span style={colLabel}>Credits</span>}
        <input
          type="number"
          placeholder="0.0"
          min="0"
          max="5"
          step="0.5"
          value={subject.credits}
          onChange={(e) => onChange({ ...subject, credits: e.target.value })}
          style={{
            ...inputBase,
            border: `1px solid ${error.credits ? "var(--red-500)" : "var(--border)"}`,
            fontFamily: "var(--font-mono)",
            textAlign: "center",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--border-focus)";
            e.target.style.boxShadow = "var(--shadow-indigo)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error.credits
              ? "var(--red-500)"
              : "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
        {error.credits && (
          <span style={{ fontSize: "11px", color: "var(--red-500)" }}>
            {error.credits}
          </span>
        )}
      </div>

      {/* Column: Grade */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {index === 0 && <span style={colLabel}>Grade</span>}
        <select
          value={subject.grade}
          onChange={(e) => onChange({ ...subject, grade: e.target.value })}
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "8px 10px",
            fontSize: "13px",
            color: gradeColor,
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            outline: "none",
            cursor: "pointer",
            width: "100%",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%234A5C72' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            paddingRight: "28px",
          }}
        >
          {VALID_GRADES.map((g) => (
            <option key={g} value={g}>
              {GRADE_LABELS[g]}
            </option>
          ))}
        </select>
      </div>

      {/* Column: Delete button */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {index === 0 && (
          <span
            style={{
              fontSize: "11px",
              color: "transparent",
              userSelect: "none",
            }}
          >
            ·
          </span>
        )}
        <button
          type="button"
          onClick={onDelete}
          title="Remove subject"
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            cursor: "pointer",
            transition: "all var(--transition)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--red-500)";
            e.currentTarget.style.borderColor = "var(--red-500)";
            e.currentTarget.style.background = "var(--red-glow)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
