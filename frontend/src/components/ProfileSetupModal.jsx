import { useEffect, useState } from "react";
import { Button, Input, Modal, Select } from "./ui";
import { courseStructureApi } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function ProfileSetupModal({ open }) {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [htNumber, setHtNumber] = useState(user?.ht_number ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [regulation, setRegulation] = useState(user?.regulation ?? "");
  const [courses, setCourses] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    courseStructureApi
      .getCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, [open]);

  useEffect(() => {
    if (!department) {
      setRegulations([]);
      return;
    }
    courseStructureApi
      .getRegulations(department)
      .then(setRegulations)
      .catch(() => setRegulations([]));
  }, [department]);

  const canSubmit =
    fullName.trim() && htNumber.trim().length >= 3 && department && regulation;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        ht_number: htNumber.trim(),
        department,
        regulation,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ?? "Could not save your profile. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      dismissible={false}
      title="Finish setting up your profile"
    >
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-muted)",
          marginBottom: "20px",
          lineHeight: 1.6,
        }}
      >
        We use this to show the right subjects for your course and enable
        autocomplete. You only need to do this once.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={50}
        />
        <Input
          label="Hall Ticket Number"
          value={htNumber}
          onChange={(e) => setHtNumber(e.target.value.toUpperCase())}
          maxLength={20}
          placeholder="e.g. 21XX1A0501"
        />
        <Select
          label="Department"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setRegulation("");
          }}
          options={[
            { value: "", label: "Select department…" },
            ...courses.map((c) => ({
              value: c.code,
              label: `${c.code} — ${c.name}`,
            })),
          ]}
        />
        <Select
          label="Regulation"
          value={regulation}
          onChange={(e) => setRegulation(e.target.value)}
          disabled={!department}
          options={[
            {
              value: "",
              label: department
                ? "Select regulation…"
                : "Select department first",
            },
            ...regulations.map((r) => ({ value: r.code, label: r.code })),
          ]}
        />
        {error && (
          <span style={{ fontSize: "13px", color: "var(--red-500)" }}>
            {error}
          </span>
        )}
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          loading={saving}
          disabled={!canSubmit}
        >
          Save and continue
        </Button>
      </div>
    </Modal>
  );
}
