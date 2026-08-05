import { useState } from "react";
import { ArrowRight, BookOpen, Cloud, Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, Card, GpaRing } from "../components/ui";
import SemesterForm from "../components/SemesterForm";
import { computeCgpa, computeSgpa } from "../utils/grading";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant calculation",
    body: "Live SGPA updates as you type.",
  },
  {
    icon: BookOpen,
    title: "JNTUA grade system",
    body: "S-F, Absent, and Complete grades handled exactly per regulations.",
  },
  {
    icon: Cloud,
    title: "Save across devices",
    body: "Sign in with Google to persist your semester history.",
  },
  {
    icon: Lock,
    title: "Private & secure",
    body: "Your data is completely secured.",
  },
];

export default function LandingPage() {
  const { isAuthenticated, promptOneTap } = useAuth();
  const navigate = useNavigate();
  const [guestSgpas, setGuestSgpas] = useState([]);
  const [activeSem, setActiveSem] = useState(1);

  const cgpa = computeCgpa(guestSgpas.map((s) => s.sgpa));

  const handleGuestCalculate = (payload) => {
    const sgpa = computeSgpa(payload.subjects);
    setGuestSgpas((prev) => {
      const existing = prev.findIndex((s) => s.sem === activeSem);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { sem: activeSem, sgpa };
        return next;
      }
      return [...prev, { sem: activeSem, sgpa }].sort((a, b) => a.sem - b.sem);
    });
    setActiveSem((n) => n + 1); // auto-advance to next semester
  };

  // Redirect authenticated users to their dashboard
  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <main style={{ flex: 1 }}>
      {/* Main */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 24px 60px",
          textAlign: "center",
        }}
        className="animate-fade-in"
      >
        <Badge color="var(--indigo-400)" style={{ marginBottom: "24px" }}>
          Free · No account needed to start
        </Badge>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "20px",
            background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Calculate your SGPA
          <br />& CGPA — instantly.
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "var(--text-secondary)",
            maxWidth: "520px",
            margin: "0 auto 36px",
            lineHeight: 1.7,
          }}
        >
          Built for JNTUA students. Enter your grades below and see your SGPA
          update live — no sign-in required.
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              document
                .getElementById("calculator")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Start calculating <ArrowRight size={16} />
          </Button>
          <Button variant="secondary" size="lg" onClick={promptOneTap}>
            Sign in to save results
          </Button>
        </div>
      </section>

      {/* Features */}
      <section
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 72px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title} style={{ padding: "20px" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: "var(--indigo-glow)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                  color: "var(--indigo-400)",
                }}
              >
                <Icon size={18} />
              </div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  marginBottom: "6px",
                }}
              >
                {title}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Guest calculator */}
      <section
        id="calculator"
        style={{ maxWidth: "820px", margin: "0 auto", padding: "0 24px 80px" }}
      >
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h2
            style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}
          >
            Try it now — Semester {activeSem}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Enter your subjects and grades. Click "Save Semester" to add it to
            your CGPA tally.
          </p>
        </div>

        <SemesterForm
          key={activeSem}
          semesterNumber={activeSem}
          onSave={handleGuestCalculate}
          showSave
        />

        {/* CGPA tally (appears after first semester) */}
        {guestSgpas.length > 0 && (
          <Card
            style={{
              marginTop: "24px",
              display: "flex",
              alignItems: "center",
              gap: "32px",
              flexWrap: "wrap",
            }}
            className="animate-fade-in"
          >
            <GpaRing
              value={cgpa}
              size={100}
              label="CGPA"
              color="var(--emerald-500)"
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "12px",
                }}
              >
                Semester breakdown
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {guestSgpas.map(({ sem, sgpa }) => (
                  <div
                    key={sem}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Sem {sem}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "var(--emerald-400)",
                      }}
                    >
                      {sgpa.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginBottom: "4px",
                }}
              >
                Your CGPA
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "var(--emerald-400)",
                  lineHeight: 1,
                }}
              >
                {cgpa.toFixed(2)}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                Sign in to save this
              </p>
            </div>
          </Card>
        )}

        {guestSgpas.length >= 1 && (
          <div
            style={{ textAlign: "center", marginTop: "20px" }}
            className="animate-fade-in"
          >
            <Button
              variant="primary"
              onClick={promptOneTap}
              style={{ gap: "10px" }}
            >
              Sign in with Google to save your progress <ArrowRight size={15} />
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
