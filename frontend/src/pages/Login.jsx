import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaGift,
  FaCrosshairs,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        const firstError = errorDetail[0];
        setError(firstError?.msg || "Validation error");
      } else {
        setError(errorDetail || "Failed to login");
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
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              marginBottom: "var(--spacing-lg)",
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
            }}
          >
            exchan.ge
          </h1>
          <p
            style={{
              color: "var(--color-text)",
              fontSize: "1rem",
              marginBottom: "var(--spacing-xl)",
              opacity: 0.9,
            }}
          >
            Organize Secret Santa and Assassins games
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-lg)",
              justifyContent: "center",
              marginBottom: "var(--spacing-xl)",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--spacing-sm)",
                padding: "var(--spacing-lg)",
                borderRadius: "var(--radius-md)",
                border: "0.0625rem solid var(--color-border)",
                minWidth: "8rem",
              }}
            >
              <FaGift
                style={{
                  fontSize: "2.5rem",
                  color: "var(--color-accent)",
                }}
              />
              <span
                style={{
                  color: "var(--color-text)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Secret Santa
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--spacing-sm)",
                padding: "var(--spacing-lg)",
                borderRadius: "var(--radius-md)",
                border: "0.0625rem solid var(--color-border)",
                minWidth: "8rem",
              }}
            >
              <FaCrosshairs
                style={{
                  fontSize: "2.5rem",
                  color: "var(--color-accent)",
                }}
              />
              <span
                style={{
                  color: "var(--color-text)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Assassins
              </span>
            </div>
          </div>
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
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
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
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p
          style={{
            marginTop: "var(--spacing-xl)",
            textAlign: "center",
            color: "var(--color-text)",
            fontSize: "0.875rem",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--color-accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Create one
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

export default Login;
