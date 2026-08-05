import { useCallback, useEffect, useState } from "react";
import { BookOpen, Edit2, Plus, Trash2, TrendingUp } from "lucide-react";
import { semestersApi } from "../utils/api";
import { computeCgpa, getPerformanceTag } from "../utils/grading";
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  GpaRing,
  Spinner,
} from "../components/ui";
import SemesterForm from "../components/SemesterForm";
import { useAuth } from "../context/AuthContext";

// SemesterCard
function SemesterCard({ semester, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const perf = getPerformanceTag(semester.sgpa);

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
        {/* Label + subject count */}
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
                gridTemplateColumns: "1fr 80px 80px",
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
              <span style={{ textAlign: "center" }}>Credits</span>
              <span style={{ textAlign: "center" }}>Grade</span>
            </div>
            {semester.subjects.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 80px",
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
                  {s.name}
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
          </div>
        </>
      )}
    </Card>
  );
}

// Dashboard page
export default function Dashboard() {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  return (
    <main
      style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px" }}
    >
      {/* Welcome header + CGPA card */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
          marginBottom: "36px",
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
            Welcome Back..!
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
              gap: "20px",
            }}
          >
            <GpaRing
              value={cgpa}
              size={90}
              label="CGPA"
              color="var(--emerald-500)"
            />
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "4px",
                }}
              >
                Cumulative GPA
              </p>
              <div
                style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "var(--emerald-400)",
                    lineHeight: 1,
                  }}
                >
                  {cgpa.toFixed(2)}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  / 10
                </span>
              </div>
              <Badge color={cgpaPerf.color} style={{ marginTop: "6px" }}>
                {cgpaPerf.label}
              </Badge>
            </div>
          </Card>
        )}
      </div>

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
          />
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
          />
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
      ) : semesters.length === 0 && !showAddForm ? (
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
          {semesters.map((semester) => (
            <div key={semester.id} style={{ position: "relative" }}>
              {/* Delete loading overlay */}
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
