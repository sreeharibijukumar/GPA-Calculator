import { Trash2 } from "lucide-react";
import {
  GRADE_COLORS,
  GRADE_LABELS,
  gradeForMarks,
  VALID_GRADES,
} from "../utils/grading";
import SubjectAutocomplete from "./SubjectAutocomplete";
import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";

export default function SubjectRow({
  subject,
  index,
  onChange,
  onDelete,
  error = {},
  authenticated = false,
  courseSubjects = [],
}) {
  const isMobile = useIsMobile();
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const gradeColor = GRADE_COLORS[subject.grade] ?? "var(--text-secondary)";

  const inputBase = {
    background: "var(--bg-input)",
    borderRadius: "var(--radius-md)",
    padding: "8px 10px",
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

  const gradeSelect = (extraStyle = {}) => (
    <select
      value={subject.grade}
      onChange={(e) => onChange({ ...subject, grade: e.target.value })}
      className="field-select"
      style={{ color: gradeColor, ...extraStyle }}
    >
      {VALID_GRADES.map((g) => (
        <option key={g} value={g}>
          {GRADE_LABELS[g]}
        </option>
      ))}
    </select>
  );

  const autocompleteHint = subject.code ? (
    <span className="subject-card-hint subject-card-hint--matched">
      {subject.code} · matched
    </span>
  ) : subject.name ? (
    <span className="subject-card-hint">
      Not found in course structure — entering manually
    </span>
  ) : null;

  // MOBILE: Vertical card
  if (isMobile) {
    return (
      <div className={`subject-card animate-fade-in${ autocompleteOpen ? "subject-card--active" : "" }`}>
        <div className="subject-card-header">
          <span className="subject-card-title">Subject {index + 1}</span>
          <button
            type="button"
            onClick={onDelete}
            className="subject-card-delete"
            aria-label={`Remove subject ${index + 1}`}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="subject-card-field">
          <span className="subject-card-label">Subject Name</span>
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
                onOpenChange={setAutocompleteOpen}
              />
              {autocompleteHint}
            </>
          ) : (
            <input 
              type="text"
              placeholder={`Subject ${index + 1}`}
              value={subject.name}
              onChange={(e) => onChange({ ...subject, name: e.target.value })}
              maxLength={75}
              className="field-input"
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
          {error.name && <span className="field-error">{error.name}</span>}
        </div>

        {authenticated ? (
          <div className="subject-card-row">
            <div className="subject-card-field">
              <span className="subject-card-label">Mark</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="—"
                min="0"
                max="100"
                step="1"
                value={subject.mark ?? ""}
                onChange={(e) => handleMarkChange(e.target.value)}
                className="field-input"
                style={{
                  ...inputBase,
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)",
                  textAlign: "center",
                }}
              />
            </div>
            <div className="subject-card-field">
              <span className="subject-card-label">Credits</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.0"
                min="0"
                max="5"
                step="0.5"
                value={subject.credits}
                onChange={(e) =>
                  onChange({ ...subject, credits: e.target.value })
                }
                className="field-input"
                style={{
                  ...inputBase,
                  border: `1px solid ${error.credits ? "var(--red-500)" : "var(--border)"}`,
                  fontFamily: "var(--font-mono)",
                  textAlign: "center",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="subject-card-field">
            <span className="subject-card-label">Credits</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              min="0"
              max="5"
              step="0.5"
              value={subject.credits}
              onChange={(e) =>
                onChange({ ...subject, credits: e.target.value })
              }
              className="field-input"
              style={{
                ...inputBase,
                border: `1px solid ${error.credits ? "var(--red-500)" : "var(--border)"}`,
                fontFamily: "var(--font-mono)",
                textAlign: "center",
              }}
            />
          </div>
        )}
        {error.credits && (
          <span className="field-error">{error.credits}</span>
        )}

        <div className="subject-card-field">
          <span className="subject-card-label">Grade</span>
          {gradeSelect()}
        </div>
      </div>
    );
  }

  // DESKTOP 
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
              onOpenChange={setAutocompleteOpen}
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
            className="field-input"
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
              className="field-input"
              style={{
                ...inputBase,
                border: "1px solid var(--border)",
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
          className="field-input"
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
        {gradeSelect()}
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
          aria-label={`Remove subject ${index + 1}`}
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
