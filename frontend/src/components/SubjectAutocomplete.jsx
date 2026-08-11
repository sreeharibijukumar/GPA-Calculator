import { useEffect, useRef, useState } from "react";
import { subjectMatches } from "../utils/grading";

export default function SubjectAutocomplete({
  value,
  onInputChange,
  onSelect,
  subjects = [],
  placeholder = "Subject name",
  error,
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);

  const matches =
    value.trim().length > 0
      ? subjects.filter((s) => subjectMatches(s, value)).slice(0, 8)
      : [];

  useEffect(() => {
    setHighlighted(0);
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectMatch = (subject) => {
    onSelect(subject);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectMatch(matches[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const inputBase = {
    background: "var(--bg-input)",
    borderRadius: "var(--radius-md)",
    padding: "8px 10px",
    fontSize: "14px",
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
    outline: "none",
    width: "100%",
    border: `1px solid ${error ? "var(--red-500)" : "var(--border)"}`,
  };

  return (
    <div ref={containerRef} style={{ position: "relative", maxWidth: "100%" }}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={75}
        style={inputBase}
        onChange={(e) => {
          onInputChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? "var(--red-500)"
            : "var(--border)";
          e.target.style.boxShadow = "none";
        }}
        onFocusCapture={(e) => {
          e.target.style.borderColor = "var(--border-focus)";
          e.target.style.boxShadow = "var(--shadow-indigo)";
        }}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-autocomplete="list"
      />
      {open && matches.length > 0 && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            maxHeight: "280px",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        >
          {matches.map((subject, i) => (
            <div
              key={subject.code}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={(e) => {
                e.preventDefault();
                selectMatch(subject);
              }}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                padding: "10px 12px",
                cursor: "pointer",
                borderLeft: `2px solid ${i === highlighted ? "var(--indigo-500)" : "transparent"}`,
                background:
                  i === highlighted ? "var(--bg-card-hover)" : "transparent",
                borderBottom:
                  i < matches.length - 1
                    ? "1px solid var(--border-subtle)"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--indigo-400)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {subject.code}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    flexShrink: 0,
                    background: "var(--bg-input)",
                    padding: "2px 7px",
                    borderRadius: "999px",
                  }}
                >
                  {subject.credits} Credits
                </span>
              </div>
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {subject.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
