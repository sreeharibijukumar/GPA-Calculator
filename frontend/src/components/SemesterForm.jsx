import { useCallback, useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import SubjectRow from "./SubjectRow";
import { Badge, Button, Card, GpaRing } from "./ui";
import {
  blankSubject,
  computeSemesterMarks,
  computeSgpa,
  getPerformanceTag,
} from "../utils/grading";
import { courseStructureApi } from "../utils/api";
import { useIsMobile } from "../hooks/useIsMobile";

export default function SemesterForm({
  initialData = null,
  semesterNumber = 1,
  onSave,
  onCancel,
  isSaving = false,
  saveError = null,
  showSave = true,
  authenticated = false,
  department = null,
  regulation = null,
}) {
  const isMobile = useIsMobile();
  const [subjects, setSubjects] = useState(
    () =>
      initialData?.subjects?.map((s) => ({
        ...s,
        _id: crypto.randomUUID(),
      })) ?? [blankSubject(), blankSubject(), blankSubject()],
  );
  const [label, setLabel] = useState(initialData?.semester_label ?? "");
  const [errors, setErrors] = useState({});
  const [courseSubjects, setCourseSubjects] = useState([]);

  useEffect(() => {
    if (!authenticated || !department || !regulation) {
      setCourseSubjects([]);
      return;
    }
    let cancelled = false;
    courseStructureApi
      .getSubjects(department, regulation, semesterNumber)
      .then((data) => {
        if (!cancelled) setCourseSubjects(data);
      })
      .catch(() => {
        if (!cancelled) setCourseSubjects([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authenticated, department, regulation, semesterNumber]);

  // Live SGPA — recomputed on every render
  const sgpa = computeSgpa(
    subjects.map((s) => ({
      credits: parseFloat(s.credits) || 0,
      grade: s.grade,
    })),
  );
  const perf = getPerformanceTag(sgpa);
  const totalCredits = subjects
    .filter((s) => s.grade !== "Complete")
    .reduce((acc, s) => acc + (parseFloat(s.credits) || 0), 0);

  const marks = authenticated ? computeSemesterMarks(subjects) : null;

  const updateSubject = useCallback((index, updated) => {
    setSubjects((prev) => prev.map((s, i) => (i === index ? updated : s)));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }, []);

  const addSubject = useCallback(() => {
    setSubjects((prev) => [...prev, blankSubject()]);
  }, []);

  const deleteSubject = useCallback((index) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validate = () => {
    const errs = {};
    subjects.forEach((s, i) => {
      const rowErr = {};
      if (!s.name.trim()) rowErr.name = "Required";
      const c = parseFloat(s.credits);
      if (isNaN(c) || c < 0 || c > 5) rowErr.credits = "0 - 5";
      if (Object.keys(rowErr).length) errs[i] = rowErr;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave?.({
      semester_number: semesterNumber,
      semester_label: label || null,
      subjects: subjects.map(({ _id, code, mark, ...rest }) => ({
        ...rest,
        credits: parseFloat(rest.credits),
        code: code || undefined,
        mark:
          mark === "" || mark === undefined || mark === null
            ? undefined
            : parseFloat(mark),
      })),
    });
  };

  const ringSize = isMobile ? 64 : 80;

  return (
    <Card style={{ padding: "0", overflow: "hidden" }}>
      <div className="semester-header">
        <div className="semester-header-info">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: "var(--indigo-glow)",
              border: "1px solid var(--indigo-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--indigo-400)",
              fontFamily: "var(--font-mono)",
              flexShrink: 0,
            }}
          >
            {semesterNumber}
          </div>
          <div style={{ minWidth: 0 }}>
            <input
              type="text"
              placeholder={`Semester ${semesterNumber}`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={25}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
                width: "100%",
              }}
            />
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {subjects.length} subject{subjects.length !== 1 ? "s" : ""} ·{" "}
              {totalCredits.toFixed(1)} effective credits
            </div>
          </div>
        </div>

        <div className="semester-header-metrics">
          <GpaRing
            value={sgpa}
            size={ringSize}
            label="SGPA"
            color={sgpa >= 7 ? "var(--emerald-500)" : "var(--indigo-500)"}
          />
          {authenticated && marks.max > 0 && (
            <GpaRing
              value={marks.percentage}
              max={100}
              size={ringSize}
              label="Marks %"
              color={
                marks.percentage >= 60
                  ? "var(--emerald-500)"
                  : "var(--amber-400)"
              }
            />
          )}
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="semester-header-close"
            aria-label="Close semester"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div style={{ padding: "0 24px" }}>
        {subjects.map((subject, i) => (
          <SubjectRow
            key={subject._id}
            subject={subject}
            index={i}
            onChange={(updated) => updateSubject(i, updated)}
            onDelete={() => deleteSubject(i)}
            error={errors[i] ?? {}}
            authenticated={authenticated}
            courseSubjects={courseSubjects}
          />
        ))}
      </div>

      {authenticated && marks.max > 0 && (
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <MarksStat label="Marks Scored" value={marks.scored} />
          <MarksStat label="Total Marks" value={marks.max} />
          <MarksStat
            label="Percentage"
            value={`${marks.percentage.toFixed(2)}%`}
            highlight
          />
        </div>
      )}

      <div className="semester-footer">
        <Button
          variant="ghost"
          size={isMobile ? "md" : "sm"}
          onClick={addSubject}
          style={{ color: "var(--indigo-400)" }}
        >
          <Plus size={15} /> Add Subject
        </Button>
        <div className="semester-footer-right">
          {sgpa > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                SGPA
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--emerald-400)",
                }}
              >
                {sgpa.toFixed(2)}
              </span>
              <Badge color={perf.color}>{perf.label}</Badge>
            </div>
          )}
          {saveError && (
            <span style={{ fontSize: "13px", color: "var(--red-500)" }}>
              {saveError}
            </span>
          )}
          {showSave && onSave && (
            <Button
              variant="primary"
              size={isMobile ? "lg" : "sm"}
              fullWidth={isMobile}
              onClick={handleSave}
              loading={isSaving}
            >
              <Save size={14} /> Save Semester
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function MarksStat({ label, value, highlight = false }) {
  return (
    <div>
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
