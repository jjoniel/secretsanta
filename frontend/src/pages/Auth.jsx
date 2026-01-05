import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaGift, FaCrosshairs, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import axios from "axios";
import hatImage from "../assets/images/hat.png";
import "../App.css";

const Auth = () => {
  const [gameType, setGameType] = useState(null); // 'santa' or 'assassins'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailExists, setEmailExists] = useState(null); // null, true, or false
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check email when it changes and is valid
    const checkEmail = async () => {
      if (!email || !email.includes("@")) {
        setEmailExists(null);
        return;
      }

      setCheckingEmail(true);
      try {
        const response = await axios.get(`/api/auth/check-email/${encodeURIComponent(email)}`);
        setEmailExists(response.data.exists);
        setError("");
      } catch (err) {
        setEmailExists(null);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    // Email check happens automatically via useEffect
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (emailExists) {
        // Login
        await login(email, password);
        navigate("/dashboard");
      } else {
        // Register
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        await register(email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        const firstError = errorDetail[0];
        setError(firstError?.msg || "Validation error");
      } else {
        setError(errorDetail || emailExists ? "Failed to login" : "Failed to register");
      }
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundStyle = () => {
    if (gameType === "santa") {
      return {
        backgroundImage: `url(${hatImage})`,
        backgroundSize: "12rem 12rem",
        backgroundRepeat: "repeat",
        backgroundPosition: "0 0",
        backgroundAttachment: "fixed",
      };
    } else if (gameType === "assassins") {
      return {
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2rem,
            rgba(249, 115, 115, 0.03) 2rem,
            rgba(249, 115, 115, 0.03) 2.1rem
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2rem,
            rgba(249, 115, 115, 0.03) 2rem,
            rgba(249, 115, 115, 0.03) 2.1rem
          )
        `,
      };
    }
    return {};
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-lg)",
        position: "relative",
        transition: "all 0.5s ease",
        ...getBackgroundStyle(),
      }}
    >
      {/* Overlay for readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: gameType
            ? "rgba(2, 6, 23, 0.85)"
            : "rgba(2, 6, 23, 0.95)",
          zIndex: 0,
          transition: "background 0.5s ease",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "28rem",
          animation: "fadeInUp 0.5s ease-out",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 700,
            marginBottom: "var(--spacing-xl)",
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          exchan.ge
        </h1>

        {/* Game Type Pills */}
        {!gameType && (
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-md)",
              justifyContent: "center",
              marginBottom: "var(--spacing-2xl)",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setGameType("santa")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-sm)",
                padding: "var(--spacing-md) var(--spacing-xl)",
                borderRadius: "9999px",
                border: "0.0625rem solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <FaGift style={{ fontSize: "1.25rem", color: "var(--color-accent)" }} />
              Secret Santa
            </button>
            <button
              onClick={() => setGameType("assassins")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-sm)",
                padding: "var(--spacing-md) var(--spacing-xl)",
                borderRadius: "9999px",
                border: "0.0625rem solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <FaCrosshairs style={{ fontSize: "1.25rem", color: "var(--color-accent)" }} />
              Assassins
            </button>
          </div>
        )}

        {/* Back button if game type selected */}
        {gameType && (
          <button
            onClick={() => {
              setGameType(null);
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setEmailExists(null);
              setError("");
            }}
            style={{
              marginBottom: "var(--spacing-lg)",
              background: "transparent",
              border: "none",
              color: "var(--color-text)",
              cursor: "pointer",
              fontSize: "0.875rem",
              opacity: 0.8,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
          >
            ← Back
          </button>
        )}

        {/* Email Form */}
        {gameType && emailExists === null && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  border: "0.0625rem solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  transition: "all var(--transition-fast)",
                }}
              />
            </div>
            {checkingEmail && (
              <p style={{ color: "var(--color-text)", fontSize: "0.875rem", opacity: 0.7 }}>
                Checking...
              </p>
            )}
            {error && (
              <div className="message message-error" role="alert">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}
          </form>
        )}

        {/* Account Exists Popup */}
        {emailExists === true && (
          <div
            style={{
              background: "rgba(74, 222, 128, 0.1)",
              border: "0.0625rem solid var(--color-success)",
              borderRadius: "var(--radius-md)",
              padding: "var(--spacing-md)",
              marginBottom: "var(--spacing-lg)",
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <FaCheck style={{ color: "var(--color-success)", fontSize: "1.25rem" }} />
            <span style={{ color: "var(--color-success)", fontSize: "0.875rem" }}>
              Account exists! Enter your password to sign in.
            </span>
          </div>
        )}

        {/* Password Form (Login or Register) */}
        {emailExists !== null && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="password">
                {emailExists ? "Password" : "Create Password"}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={emailExists ? "Enter your password" : "At least 6 characters"}
                required
                autoComplete={emailExists ? "current-password" : "new-password"}
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  border: "0.0625rem solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  transition: "all var(--transition-fast)",
                }}
              />
            </div>

            {!emailExists && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    border: "0.0625rem solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                    transition: "all var(--transition-fast)",
                  }}
                />
                <small
                  style={{
                    color: "var(--color-text)",
                    fontSize: "0.8125rem",
                    marginTop: "var(--spacing-xs)",
                    display: "block",
                    opacity: 0.7,
                  }}
                >
                  Must be at least 6 characters
                </small>
              </div>
            )}

            {error && (
              <div className="message message-error" role="alert">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "var(--spacing-md)" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner"
                    style={{
                      width: "1rem",
                      height: "1rem",
                      borderWidth: "0.125rem",
                    }}
                  />
                  <span>{emailExists ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : (
                emailExists ? "Sign In" : "Create Account"
              )}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-0.5rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;

