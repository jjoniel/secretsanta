import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", {
        token,
        new_password: password,
      });
      setSuccess("Password reset. Redirecting to sign in...");
      setTimeout(() => {
        navigate("/auth");
      }, 1500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Failed to reset password. Try requesting a new link.");
    } finally {
      setLoading(false);
    }
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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "28rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
            fontWeight: 700,
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
            textAlign: "center",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          exchan.ge
        </h1>

        <h2
          style={{
            fontSize: "0.95rem",
            fontWeight: 500,
            color: "var(--color-text)",
            opacity: 0.85,
            textAlign: "center",
            marginBottom: "var(--spacing-lg)",
          }}
        >
          reset your password
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "20rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div style={{ marginBottom: "var(--spacing-md)" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="create a new password"
              required
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "var(--spacing-sm) var(--spacing-lg)",
                border: "0.0625rem solid var(--color-border)",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                textAlign: "center",
              }}
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-md)" }}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="confirm new password"
              required
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "var(--spacing-sm) var(--spacing-lg)",
                border: "0.0625rem solid var(--color-border)",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                textAlign: "center",
              }}
            />
          </div>

          {error && (
            <div className="message message-error" role="alert">
              <span>{error}</span>
            </div>
          )}
          {success && !error && (
            <div className="message message-success" role="status">
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              marginTop: "var(--spacing-md)",
              borderRadius: "9999px",
            }}
            disabled={loading}
          >
            {loading ? "Resetting..." : "reset password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/auth")}
            style={{
              marginTop: "var(--spacing-sm)",
              background: "transparent",
              border: "none",
              padding: 0,
              color: "var(--color-text)",
              opacity: 0.8,
              fontSize: "0.75rem",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            back to sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;


