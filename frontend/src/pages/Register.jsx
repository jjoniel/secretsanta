import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { FaSnowflake, FaExclamationTriangle } from "react-icons/fa";
import "../App.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        const firstError = errorDetail[0];
        setError(firstError?.msg || "Validation error");
      } else {
        setError(errorDetail || "Failed to register");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-md)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "var(--spacing-lg)",
          right: "var(--spacing-lg)",
        }}
      >
        <ThemeToggle />
      </div>

      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "28rem",
          animation: "fadeInUp 0.5s ease-out",
        }}
      >
        <div
          style={{ textAlign: "center", marginBottom: "var(--spacing-2xl)" }}
        >
          <div
            style={{
              fontSize: "3.5rem",
              marginBottom: "var(--spacing-md)",
              lineHeight: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <FaSnowflake style={{ color: "var(--color-accent)" }} />
          </div>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              fontWeight: 700,
              marginBottom: "var(--spacing-sm)",
              color: "var(--color-text-primary)",
            }}
          >
            Join Secret Santa
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.9375rem",
            }}
          >
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <small
              style={{
                color: "var(--color-text-tertiary)",
                fontSize: "0.8125rem",
                marginTop: "var(--spacing-xs)",
                display: "block",
              }}
            >
              Must be at least 6 characters
            </small>
          </div>
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
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p
          style={{
            marginTop: "var(--spacing-xl)",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            fontSize: "0.875rem",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--color-accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
        </p>
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
      `}</style>
    </div>
  );
};

export default Register;
