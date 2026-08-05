import { forwardRef } from "react";

const BUTTON_VARIANTS = {
  primary: {
    background: "var(--indigo-500)",
    color: "#fff",
    border: "none",
    hover: "var(--indigo-600)",
  },
  secondary: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border)",
    hover: "var(--bg-card-hover)",
  },
  danger: {
    background: "transparent",
    color: "var(--red-500)",
    border: "1px solid var(--red-500)",
    hover: "var(--red-glow)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "none",
    hover: "var(--bg-card-hover)",
  },
};

//Button
export const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    style: extraStyle = {},
    onClick,
    type = "button",
    ...props
  },
  ref,
) {
  const v = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary;
  const pad =
    size === "sm" ? "6px 14px" : size === "lg" ? "12px 28px" : "9px 20px";
  const fs = size === "sm" ? "13px" : size === "lg" ? "16px" : "14px";
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: pad,
        fontSize: fs,
        fontWeight: 500,
        fontFamily: "var(--font-sans)",
        borderRadius: "var(--radius-md)",
        border: v.border,
        background: v.background,
        color: v.color,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
        transition: "background var(--transition)",
        width: fullWidth ? "100%" : undefined,
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = v.hover;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading)
          e.currentTarget.style.background = v.background;
      }}
      {...props}
    >
      {loading && <Spinner size={14} color="currentColor" />}
      {children}
    </button>
  );
});

//Card
export function Card({
  children,
  style = {},
  className = "",
  hoverable = false,
  ...props
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        transition: hoverable
          ? "border-color var(--transition), background var(--transition)"
          : undefined,
        ...style,
      }}
      onMouseEnter={
        hoverable
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--border-focus)";
              e.currentTarget.style.background = "var(--bg-card-hover)";
            }
          : undefined
      }
      onMouseLeave={
        hoverable
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--bg-card)";
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}

//Input
export const Input = forwardRef(function Input(
  { label, error, style = {}, containerStyle = {}, ...props },
  ref,
) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        ...containerStyle,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        style={{
          background: "var(--bg-input)",
          border: `1px solid ${error ? "var(--red-500)" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          padding: "9px 12px",
          fontSize: "14px",
          color: "var(--text-primary)",
          fontFamily: "var(--font-sans)",
          outline: "none",
          transition:
            "border-color var(--transition), box-shadow var(--transition)",
          width: "100%",
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--border-focus)";
          e.currentTarget.style.boxShadow = "var(--shadow-indigo)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? "var(--red-500)"
            : "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: "12px", color: "var(--red-500)" }}>
          {error}
        </span>
      )}
    </div>
  );
});

//Select
export const Select = forwardRef(function Select(
  { label, options = [], error, style = {}, containerStyle = {}, ...props },
  ref,
) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        ...containerStyle,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        style={{
          background: "var(--bg-input)",
          border: `1px solid ${error ? "var(--red-500)" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          padding: "9px 12px",
          fontSize: "14px",
          color: "var(--text-primary)",
          fontFamily: "var(--font-sans)",
          outline: "none",
          cursor: "pointer",
          width: "100%",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%234A5C72' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "36px",
          ...style,
        }}
        {...props}
      >
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ),
        )}
      </select>
      {error && (
        <span style={{ fontSize: "12px", color: "var(--red-500)" }}>
          {error}
        </span>
      )}
    </div>
  );
});

//Badge
export function Badge({
  children,
  color = "var(--indigo-400)",
  bg,
  style = {},
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        color,
        background: bg ?? `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

//Spinner
export function Spinner({ size = 20, color = "var(--indigo-400)" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2.5"
        strokeOpacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// GpaRing — animated circular score display
export function GpaRing({
  value,
  max = 10,
  size = 120,
  label = "SGPA",
  color = "var(--indigo-500)",
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(value / max, 1));
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: size * 0.22,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          {value > 0 ? value.toFixed(2) : "—"}
        </span>
        <span
          style={{
            fontSize: size * 0.1,
            color: "var(--text-muted)",
            marginTop: 2,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

//Divider
export function Divider({ style = {} }) {
  return (
    <hr
      style={{ border: "none", borderTop: "1px solid var(--border)", ...style }}
    />
  );
}

//EmptyState
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      {Icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-md)",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          <Icon size={22} />
        </div>
      )}
      <div>
        <p
          style={{
            fontWeight: 600,
            fontSize: "15px",
            color: "var(--text-primary)",
            marginBottom: "4px",
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              maxWidth: "320px",
              margin: "0 auto",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
