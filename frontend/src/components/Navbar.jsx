import React from "react";
import { GraduationCap, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui";
import GoogleSignInButton from "./GoogleSignInButton";

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg-overlay)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: "16px",
            letterSpacing: "-0.03em",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-md)",
              background: "var(--indigo-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={17} color="#fff" strokeWidth={2} />
          </div>
          GPA CALCULATOR
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-muted)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "99px",
              padding: "2px 8px",
              letterSpacing: "0.04em",
            }}
          >
            JNTUA
          </span>
        </Link>

        {/* Nav links (authenticated only) */}
        {isAuthenticated && (
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/calculator", label: "Calculator" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "14px",
                  fontWeight: 500,
                  color:
                    location.pathname === to
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  background:
                    location.pathname === to ? "var(--bg-card)" : "transparent",
                  border:
                    location.pathname === to
                      ? "1px solid var(--border)"
                      : "1px solid transparent",
                  textDecoration: "none",
                  transition:
                    "color var(--transition), background var(--transition)",
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Auth section */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isLoading ? null : isAuthenticated ? (
            <>
              {/* Avatar */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {user.picture_url ? (
                  <img
                    src={user.picture_url}
                    alt={user.full_name??user.email}
                    referrerPolicy="no-referrer"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "2px solid var(--border)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "var(--indigo-500)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {(user.full_name??user.email)[0].toUpperCase()}
                  </div>
                )}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    maxWidth: "160px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.full_name??user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title="Sign out"
                style={{ padding: "6px 8px", color: "var(--text-muted)" }}
              >
                <LogOut size={15} />
              </Button>
            </>
          ) : (
            <GoogleSignInButton style={{ borderRadius: "var(--radius-md)" }}>
              <Button
                variant="primary"
                size="sm"
                style={{ gap: "8px" }}
              >
                {/* Inline Google G icon */}
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                    fill="#fff"
                    fillOpacity=".9"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.258c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                    fill="#fff"
                    fillOpacity=".7"
                  />
                  <path
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                    fill="#fff"
                    fillOpacity=".5"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                    fill="#fff"
                    fillOpacity=".8"
                  />
                </svg>
                Sign in with Google
              </Button>
            </GoogleSignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
