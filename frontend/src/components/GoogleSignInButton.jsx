import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export default function GoogleSignInButton({
  children,
  className,
  style,
  buttonOptions,
}) {
  const overlayRef = useRef(null);
  const { renderSignInButton } = useAuth();

  useEffect(() => {
    if (overlayRef.current) {
      renderSignInButton(overlayRef.current, {
        size: "large",
        width: 320,
        ...buttonOptions,
      });
    }
  }, [renderSignInButton, buttonOptions]);

  return (
    <div
      className={className}
      style={{ position: "relative", display: "inline-block", ...style }}
    >
      <div style={{ pointerEvents: "none" }}>{children}</div>

      <div
        ref={overlayRef}
        aria-label="Sign in with Google"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          overflow: "hidden",
          cursor: "pointer",
        }}
      />
    </div>
  );
}
