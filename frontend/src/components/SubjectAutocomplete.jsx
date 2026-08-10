import { useEffect, useRef, useState } from "react";
import { subjectMatches } from "../utils/grading";

export default function SubjectAutocomplete({
  value,
  onInputChange,
  onSelect,
  subjects = [],
  placeholder = 'Subject name',
  error,
}) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const containerRef = useRef(null)

  const matches = value.trim().length > 0
    ? subjects.filter((s) => subjectMatches(s, value)).slice(0, 8)
    : []

  useEffect(() => {
    setHighlighted(0)
  }, [value])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const selectMatch = (subject) => {
    onSelect(subject)
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open || matches.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((i) => Math.min(i + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectMatch(matches[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const inputBase = {
    background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
    padding: '8px 10px', fontSize: '14px', color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)', outline: 'none', width: '100%',
    border: `1px solid ${error ? 'var(--red-500)' : 'var(--border)'}`,
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={75}
        style={inputBase}
        onChange={(e) => { onInputChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--red-500)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
        onFocusCapture={(e) => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = 'var(--shadow-indigo)' }}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-autocomplete="list"
      />
      {open && matches.length > 0 && (
        <div
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            maxHeight: '220px', overflowY: 'auto',
          }}
        >
          {matches.map((subject, i) => (
            <div
              key={subject.code}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={(e) => { e.preventDefault(); selectMatch(subject) }}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                background: i === highlighted ? 'var(--bg-card-hover)' : 'transparent',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                  color: 'var(--indigo-400)', flexShrink: 0,
                }}>{subject.code}</span>
                <span style={{
                  color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{subject.name}</span>
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                {subject.credits} Credits
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}