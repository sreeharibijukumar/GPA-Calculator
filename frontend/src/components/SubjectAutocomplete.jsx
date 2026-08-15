import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { subjectMatches } from "../utils/grading";

const GAP = 6;
const VIEWPORT_MARGIN = 8;
const MIN_OPEN_SPACE = 180;
const MAX_DROPDOWN_HEIGHT = 320;

export default function SubjectAutocomplete({
  value,
  onInputChange,
  onSelect,
  subjects = [],
  placeholder = "Subject name",
  error,
  onOpenChange,
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [position, setPosition] = useState(null);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionRefs = useRef([]);

  const matches =
    value.trim().length > 0
      ? subjects.filter((s) => subjectMatches(s, value)).slice(0, 8)
      : [];

  const setOpenState = useCallback(
    (next) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  useEffect(() => {
    setHighlighted(0);
  }, [value]);

  const recomputePosition = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < MIN_OPEN_SPACE && spaceAbove > spaceBelow;

    const available =
      (openUpward ? spaceAbove : spaceBelow) - GAP - VIEWPORT_MARGIN;
    const maxHeight = Math.max(120, Math.min(MAX_DROPDOWN_HEIGHT, available));

    let left = rect.left;
    let width = rect.width;
    const maxRight = viewportWidth - VIEWPORT_MARGIN;
    if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
    if (left + width > maxRight) width = Math.max(120, maxRight - left);

    setPosition({
      left,
      width,
      maxHeight,
      top: openUpward ? null : rect.bottom + GAP,
      bottom: openUpward ? viewportHeight - rect.top + GAP : null,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    recomputePosition();

    let raf = null;
    const onViewportChange = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recomputePosition);
    };

    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    window.visualViewport?.addEventListener("resize", onViewportChange);
    window.visualViewport?.addEventListener("scroll", onViewportChange);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("scroll", onViewportChange);
    };
  }, [open, recomputePosition]);

  useEffect(() => {
    const onClickOutside = (e) => {
      const inWrapper = wrapperRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inWrapper && !inDropdown) setOpenState(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, [setOpenState]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  const selectMatch = (subject) => {
    onSelect(subject);
    setOpenState(false);
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
      setOpenState(false);
    }
  };

  const inputBase = {
    background: "var(--bg-input)",
    borderRadius: "var(--radius-md)",
    padding: "8px 10px",
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
    outline: "none",
    width: "100%",
    border: `1px solid ${error ? "var(--red-500)" : "var(--border)"}`,
  };

  const showDropdown = open && matches.length > 0 && position;

  return (
    <div ref={wrapperRef} style={{ position: "relative", maxWidth: "100%" }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={75}
        className="field-input"
        style={inputBase}
        onChange={(e) => {
          onInputChange(e.target.value);
          setOpenState(true);
        }}
        onFocus={(e) => {
          setOpenState(true);
          e.target.style.borderColor = "var(--border-focus)";
          e.target.style.boxShadow = "var(--shadow-indigo)";
          requestAnimationFrame(() => {
            inputRef.current?.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          });
        }}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? "var(--red-500)"
            : "var(--border)";
          e.target.style.boxShadow = "none";
        }}
        autoComplete="off"
        role="combobox"
        aria-expanded={!!showDropdown}
        aria-autocomplete="list"
        aria-controls="subject-autocomplete-listbox"
        aria-activedescendant={
          showDropdown ? `subject-option-${highlighted}` : undefined
        }
      />
      {showDropdown &&
        createPortal(
          <div
            ref={dropdownRef}
            id="subject-autocomplete-listbox"
            role="listbox"
            className="ac-dropdown"
            style={{
              position: "fixed",
              left: position.left,
              width: position.width,
              top: position.top ?? "auto",
              bottom: position.bottom ?? "auto",
              maxHeight: position.maxHeight,
            }}
          >
            {matches.map((subject, i) => (
              <div
                key={subject.code}
                id={`subject-option-${i}`}
                ref={(el) => (optionRefs.current[i] = el)}
                role="option"
                aria-selected={i === highlighted}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectMatch(subject);
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={`ac-option${
                  i === highlighted ? " ac-option--active" : ""
                }`}
              >
                <div className="ac-option-top">
                  <span className="ac-option-code">{subject.code}</span>
                  <span className="ac-option-badge">
                    {subject.credits} Credits
                  </span>
                </div>
                <span className="ac-option-name">{subject.name}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
