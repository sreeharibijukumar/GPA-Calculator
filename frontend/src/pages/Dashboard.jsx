import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Edit2,
  Plus,
  Trash2,
  TrendingUp,
  Settings2,
} from "lucide-react";
import { courseStructureApi, semestersApi } from "../utils/api";
import { computeCgpa, computeOverallMarks, computeSemesterMarks, getPerformanceTag } from "../utils/grading";
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  GpaRing,
  Select,
  Spinner,
} from "../components/ui";
import SemesterForm from "../components/SemesterForm";
import { useAuth } from "../context/AuthContext";
import ProfileSetupModal from "../components/ProfileSetupModal";

// SemesterCard
function SemesterCard({ semester, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const perf = getPerformanceTag(semester.sgpa);

  const marks = computeSemesterMarks(semester.subjects ?? []);

  // Shared icon button styles
  const iconBtn = {
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    color: "var(--text-muted)",
    transition: "all var(--transition)",
  };
  const applyHover = (e, color, bg) => {
    e.currentTarget.style.color = color;
    e.currentTarget.style.borderColor = color;
    e.currentTarget.style.background = bg;
  };
  const resetHover = (e) => {
    e.currentTarget.style.color = "var(--text-muted)";
    e.currentTarget.style.borderColor = "var(--border)";
    e.currentTarget.style.background = "transparent";
  };

  return (
    <Card
      hoverable
      style={{ padding: "0", overflow: "hidden", cursor: "default" }}
      className="animate-fade-in"
    >
      {/* Clickable header row */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Semester number badge */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            background: "var(--indigo-glow)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--indigo-400)",
            fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}
        >
          {semester.semester_number}
        </div>
        {/* Label + subject count + marks summary */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 600,
              fontSize: "15px",
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            {semester.semester_label ?? `Semester ${semester.semester_number}`}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            {semester.subjects.length} subjects · click to{" "}
            {expanded ? "collapse" : "expand"}
          </p>
          {marks.scored > 0 && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                marginTop: "2px",
              }}
            >
              Marks: {marks.scored} / {marks.max} · {marks.percentage.toFixed(2)}%
            </p>
          )}
        </div>
        {/* SGPA + performance badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <Badge color={perf.color}>{perf.label}</Badge>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--emerald-400)",
            }}
          >
            {semester.sgpa.toFixed(2)}
          </span>
        </div>
        {/* Edit/Delete buttons */}
        <div
          style={{ display: "flex", gap: "6px", flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            style={iconBtn}
            onClick={() => onEdit(semester)}
            title="Edit"
            onMouseEnter={(e) =>
              applyHover(e, "var(--indigo-400)", "var(--indigo-glow)")
            }
            onMouseLeave={resetHover}
          >
            <Edit2 size={14} />
          </button>
          <button
            style={iconBtn}
            onClick={() => onDelete(semester)}
            title="Delete"
            onMouseEnter={(e) =>
              applyHover(e, "var(--red-500)", "var(--red-glow)")
            }
            onMouseLeave={resetHover}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expandable subject table */}
      {expanded && (
        <>
          <Divider />
          <div style={{ padding: "12px 20px 16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 70px 80px 80px",
                gap: "8px",
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "0 0 8px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <span>Subject</span>
              <span style={{ textAlign: "center" }}>Mark</span>
              <span style={{ textAlign: "center" }}>Credits</span>
              <span style={{ textAlign: "center" }}>Grade</span>
            </div>
            {semester.subjects.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 70px 80px 80px",
                  gap: "8px",
                  padding: "8px 0",
                  alignItems: "center",
                  borderBottom:
                    i < semester.subjects.length - 1
                      ? "1px solid var(--border-subtle)"
                      : "none",
                }}
              >
                <span
                  style={{ fontSize: "14px", color: "var(--text-primary)" }}
                >
                  {s.code ? `${s.code} — ${s.name}` : s.name}
                </span>
                <span
                  style={{
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s.mark ?? "—"}
                </span>
                <span
                  style={{
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s.credits}
                </span>
                <span
                  style={{
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color:
                      s.grade === "Complete"
                        ? "var(--text-muted)"
                        : s.grade === "F" || s.grade === "Absent"
                          ? "var(--red-500)"
                          : "var(--indigo-400)",
                  }}
                >
                  {s.grade}
                </span>
              </div>
            ))}

            {marks.scored > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <SmallStat label="Marks Scored" value={marks.scored} />
                <SmallStat label="Total Marks" value={marks.max} />
                <SmallStat
                  label="Percentage"
                  value={`${marks.percentage.toFixed(2)}%`}
                  highlight
                />
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

// Tiny stat block reused by SemesterCard's expanded footer.
// Same visual language as SemesterForm's MarksStat, kept local here
// Since SemesterCard is itself a page-local component.
function SmallStat({ label, value, highlight = false }) {
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
          fontSize: "16px",
          fontWeight: 700,
          color: highlight ? "var(--emerald-400)" : "var(--text-primary)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// Small editable Department/Regulation
function CourseContextBar({ department, regulation, onChange }) {
  const [editing, setEditing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [dept, setDept] = useState(department);
  const [reg, setReg] = useState(regulation);

  useEffect(() => {
    if (!editing) return;
    courseStructureApi
      .getCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, [editing]);

  useEffect(() => {
    if (!dept) {
      setRegulations([]);
      return;
    }
    courseStructureApi
      .getRegulations(dept)
      .then(setRegulations)
      .catch(() => setRegulations([]));
  }, [dept]);

  if (!editing) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <Badge color="var(--indigo-400)">
          {department} · {regulation}
        </Badge>
        <button
          onClick={() => {
            setDept(department);
            setReg(regulation);
            setEditing(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          <Settings2 size={13} /> Change course/regulation
        </button>
      </div>
    );
  }

  return (
    <Card
      style={{
        marginBottom: "20px",
        display: "flex",
        gap: "12px",
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}
    >
      <Select
        label="Department"
        value={dept}
        onChange={(e) => {
          setDept(e.target.value);
          setReg("");
        }}
        options={courses.map((c) => ({
          value: c.code,
          label: `${c.code} — ${c.name}`,
        }))}
        containerStyle={{ minWidth: 200 }}
      />
      <Select
        label="Regulation"
        value={reg}
        onChange={(e) => setReg(e.target.value)}
        options={regulations.map((r) => ({ value: r.code, label: r.code }))}
        containerStyle={{ minWidth: 120 }}
      />
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          onChange(dept, reg);
          setEditing(false);
        }}
        disabled={!dept || !reg}
      >
        Save
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </Card>
  );
}

// Dashboard page
export default function Dashboard() {
  const { user, needsProfileSetup } = useAuth();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [ctxDepartment, setCtxDepartment] = useState(user?.department ?? null);
  const [ctxRegulation, setCtxRegulation] = useState(user?.regulation ?? null);
  useEffect(() => {
    setCtxDepartment(user?.department ?? null);
    setCtxRegulation(user?.regulation ?? null);
  }, [user?.department, user?.regulation]);

  const fetchSemesters = useCallback(async () => {
    try {
      setError(null);
      const data = await semestersApi.list();
      setSemesters(data);
    } catch (err) {
      setError("Failed to load semesters. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const cgpa = computeCgpa(semesters.map((s) => s.sgpa));
  const cgpaPerf = getPerformanceTag(cgpa);
  const overallMarks = computeOverallMarks(semesters);
  const nextSemNumber =
    semesters.length > 0
      ? Math.max(...semesters.map((s) => s.semester_number)) + 1
      : 1;

  const handleCreate = async (payload) => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const created = await semestersApi.create(payload);
      setSemesters((prev) =>
        [...prev, created].sort(
          (a, b) => a.semester_number - b.semester_number,
        ),
      );
      setShowAddForm(false);
    } catch (err) {
      setSaveError(err.response?.data?.detail ?? "Save failed. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingSemester) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      const updated = await semestersApi.update(editingSemester.id, {
        semester_label: payload.semester_label,
        subjects: payload.subjects,
      });
      setSemesters((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
      setEditingSemester(null);
    } catch (err) {
      setSaveError(err.response?.data?.detail ?? "Update failed. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (semester) => {
    setDeletingId(semester.id);
    try {
      await semestersApi.delete(semester.id);
      setSemesters((prev) => prev.filter((s) => s.id !== semester.id));
    } catch (err) {
      console.error("[Dashboard] delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const visibleSemesters = editingSemester
    ? semesters.filter((s) => s.id !== editingSemester.id)
    : semesters;

  return (
    <main
      style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px" }}
    >
      <ProfileSetupModal open={needsProfileSetup} />

      {/* Welcome header + Top summary card */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "6px",
            }}
          >
            Welcome back
            {user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {semesters.length === 0
              ? "Add your first semester to start tracking your CGPA."
              : `${semesters.length} semester${semesters.length !== 1 ? "s" : ""} saved.`}
          </p>
        </div>
        {semesters.length > 0 && (
          <Card
            style={{
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              gap: "28px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <GpaRing
                value={cgpa}
                size={90}
                label="CGPA"
                color="var(--emerald-500)"
              />
              <Badge color={cgpaPerf.color} style={{ marginTop: "8px" }}>
                {cgpaPerf.label}
              </Badge>
            </div>
            {overallMarks.max > 0 && (
              <div style={{ textAlign: "center" }}>
                <GpaRing
                  value={overallMarks.percentage}
                  max={100}
                  size={90}
                  label="Overall %"
                  color="var(--indigo-500)"
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "8px",
                  }}
                >
                  {overallMarks.scored} / {overallMarks.max} marks
                </p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* course context bar */}
      {!needsProfileSetup && ctxDepartment && ctxRegulation && (
        <CourseContextBar
          department={ctxDepartment}
          regulation={ctxRegulation}
          onChange={(d, r) => {
            setCtxDepartment(d);
            setCtxRegulation(r);
          }}
        />
      )}

      {/* Semesters section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <TrendingUp size={16} color="var(--indigo-400)" /> Semesters
        </h2>
        {!showAddForm && !editingSemester && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} /> Add Semester
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div style={{ marginBottom: "20px" }} className="animate-fade-in">
          <SemesterForm
            semesterNumber={nextSemNumber}
            onSave={handleCreate}
            onCancel={() => {
              setShowAddForm(false);
              setSaveError(null);
            }}
            isSaving={isSaving}
            saveError={saveError}
            authenticated
            department={ctxDepartment}
            regulation={ctxRegulation}
          />{" "}
        </div>
      )}

      {/* Edit form */}
      {editingSemester && (
        <div style={{ marginBottom: "20px" }} className="animate-fade-in">
          <SemesterForm
            initialData={editingSemester}
            semesterNumber={editingSemester.semester_number}
            onSave={handleUpdate}
            onCancel={() => {
              setEditingSemester(null);
              setSaveError(null);
            }}
            isSaving={isSaving}
            saveError={saveError}
            authenticated
            department={ctxDepartment}
            regulation={ctxRegulation}
          />{" "}
        </div>
      )}

      {/* Semester list */}
      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <Spinner size={28} />
        </div>
      ) : error ? (
        <Card
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--red-500)",
          }}
        >
          {error}
        </Card>
      ) : visibleSemesters.length === 0 && !showAddForm ? (
        <EmptyState
          icon={BookOpen}
          title="No semesters yet"
          description="Add your first semester to start tracking your SGPA and CGPA."
          action={
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              <Plus size={14} />
              Add Semester 1
            </Button>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {visibleSemesters.map((semester) => (
            <div key={semester.id} style={{ position: "relative" }}>
              {deletingId === semester.id && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    background: "var(--bg-overlay)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Spinner />
                </div>
              )}
              <SemesterCard
                semester={semester}
                onEdit={(s) => {
                  setEditingSemester(s);
                  setShowAddForm(false);
                  setSaveError(null);
                }}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
