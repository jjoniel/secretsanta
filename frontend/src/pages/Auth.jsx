import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaGift,
  FaCrosshairs,
  FaExclamationTriangle,
  FaCheck,
  FaCheckCircle,
} from "react-icons/fa";
import axios from "axios";
import hatImage from "../assets/images/hat.png";
import watergunImage from "../assets/images/watergun.png";
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
        const response = await axios.get(
          `/api/auth/check-email/${encodeURIComponent(email)}`
        );
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
        setError(
          errorDetail || emailExists ? "Failed to login" : "Failed to register"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate random hat rotations (45, 135, 225, or 315 degrees)
  const getRandomRotation = () => {
    const angles = [45, 135, 225, 315];
    return angles[Math.floor(Math.random() * angles.length)];
  };

  const [patternPositions, setPatternPositions] = useState([]);

  useEffect(() => {
    if (gameType === "santa" || gameType === "assassins") {
      // Generate pattern positions for background
      const generatePatternPositions = () => {
        const items = [];
        const spacing = 15; // rem spacing between items
        // Use viewport dimensions, fallback to reasonable defaults
        const viewportWidth =
          typeof window !== "undefined" ? window.innerWidth : 1920;
        const viewportHeight =
          typeof window !== "undefined" ? window.innerHeight : 1080;
        const remInPx = 16; // 1rem = 16px
        const cols = Math.ceil(viewportWidth / (spacing * remInPx)) + 2; // +2 for overflow
        const rows = Math.ceil(viewportHeight / (spacing * remInPx)) + 2;

        for (let row = -1; row < rows; row++) {
          for (let col = -1; col < cols; col++) {
            // Stagger every other row by half spacing
            const xOffset = row % 2 === 0 ? 0 : spacing / 2;
            items.push({
              id: `${row}-${col}`,
              x: col * spacing + xOffset,
              y: row * spacing,
              rotation: getRandomRotation(),
            });
          }
        }
        return items;
      };

      setPatternPositions(generatePatternPositions());

      // Regenerate on window resize
      const handleResize = () => {
        setPatternPositions(generatePatternPositions());
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    } else {
      setPatternPositions([]);
    }
  }, [gameType]);

  const getBackgroundStyle = () => {
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
      {/* Randomly rotated pattern for Santa (hats) */}
      {gameType === "santa" && patternPositions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          {patternPositions.map((item) => (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: `${item.x}rem`,
                top: `${item.y}rem`,
                width: "2rem",
                height: "2rem",
                backgroundImage: `url(${hatImage})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                transform: `rotate(${item.rotation}deg)`,
                opacity: 0.15,
              }}
            />
          ))}
        </div>
      )}

      {/* Randomly rotated pattern for Assassins (water guns) */}
      {gameType === "assassins" && patternPositions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          {patternPositions.map((item) => (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: `${item.x}rem`,
                top: `${item.y}rem`,
                width: "2rem",
                height: "2rem",
                backgroundImage: `url(${watergunImage})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                transform: `rotate(${item.rotation}deg)`,
                opacity: 0.15,
              }}
            />
          ))}
        </div>
      )}

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

        {/* Subheading */}
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            marginBottom: "var(--spacing-lg)",
            color: "var(--color-text)",
            letterSpacing: "-0.01em",
            textAlign: "center",
          }}
        >
          jump right in
        </h2>

        {/* Game Type Pills */}
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-sm)",
            justifyContent: "center",
            marginBottom: "var(--spacing-lg)",
            flexWrap: "wrap",
            width: "100%",
            maxWidth: "20rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <button
            onClick={() => setGameType("santa")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-sm)",
              padding: "var(--spacing-sm) var(--spacing-lg)",
              borderRadius: "9999px",
              border: `0.0625rem solid ${
                gameType === "santa"
                  ? "var(--color-accent)"
                  : "var(--color-border)"
              }`,
              background:
                gameType === "santa"
                  ? "rgba(249, 115, 115, 0.1)"
                  : "var(--color-bg)",
              color: "var(--color-text)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s ease",
              flex: "1 1 calc(50% - var(--spacing-sm) / 2)",
              minWidth: 0,
            }}
            onMouseEnter={(e) => {
              if (gameType !== "santa") {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (gameType !== "santa") {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            <FaGift
              style={{ fontSize: "1rem", color: "var(--color-accent)" }}
            />
            secret santa
          </button>
          <button
            onClick={() => setGameType("assassins")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-sm)",
              padding: "var(--spacing-sm) var(--spacing-lg)",
              borderRadius: "9999px",
              border: `0.0625rem solid ${
                gameType === "assassins"
                  ? "var(--color-accent)"
                  : "var(--color-border)"
              }`,
              background:
                gameType === "assassins"
                  ? "rgba(249, 115, 115, 0.1)"
                  : "var(--color-bg)",
              color: "var(--color-text)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s ease",
              flex: "1 1 calc(50% - var(--spacing-sm) / 2)",
              minWidth: 0,
            }}
            onMouseEnter={(e) => {
              if (gameType !== "assassins") {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (gameType !== "assassins") {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            <FaCrosshairs
              style={{ fontSize: "1rem", color: "var(--color-accent)" }}
            />
            assassins
          </button>
        </div>

        {/* Email Form - Always visible */}
        <form
          onSubmit={handleEmailSubmit}
          style={{
            marginBottom: "var(--spacing-lg)",
            width: "100%",
            maxWidth: "20rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                required
                autoComplete="email"
                autoFocus
                style={{
                  width: "100%",
                  padding: "var(--spacing-sm) var(--spacing-lg)",
                  paddingRight: "var(--spacing-lg)",
                  border: "0.0625rem solid var(--color-border)",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  transition: "all var(--transition-fast)",
                  textAlign: "center",
                }}
              />
              {emailExists === true && (
                <FaCheckCircle
                  title="account found!"
                  style={{
                    position: "absolute",
                    right: "var(--spacing-sm)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-success)",
                    fontSize: "1.25rem",
                    background: "transparent",
                    border: "0.125rem solid var(--color-success)",
                    borderRadius: "50%",
                    padding: "0.125rem",
                    cursor: "help",
                    animation: "checkmarkIn 0.3s ease-out",
                  }}
                />
              )}
            </div>
          </div>
          {checkingEmail && (
            <p
              style={{
                color: "var(--color-text)",
                fontSize: "0.875rem",
                opacity: 0.7,
                textAlign: "center",
                marginTop: "var(--spacing-sm)",
              }}
            >
              Checking...
            </p>
          )}
        </form>

        {/* Password Form (Login or Register) - Always present but invisible */}
        <form
          onSubmit={handlePasswordSubmit}
          style={{
            width: "100%",
            maxWidth: "20rem",
            marginLeft: "auto",
            marginRight: "auto",
            opacity: emailExists !== null ? 1 : 0,
            visibility: emailExists !== null ? "visible" : "hidden",
            transition: "opacity var(--transition-base)",
          }}
        >
          <div style={{ marginBottom: "var(--spacing-md)" }}>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                emailExists ? "enter your password" : "create a password"
              }
              required
              autoComplete={
                emailExists ? "current-password" : "new-password"
              }
              autoFocus={emailExists !== null}
              style={{
                width: "100%",
                padding: "var(--spacing-sm) var(--spacing-lg)",
                border: "0.0625rem solid var(--color-border)",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                transition: "all var(--transition-fast)",
                textAlign: "center",
              }}
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
                <span>
                  {emailExists ? "Signing in..." : "Creating account..."}
                </span>
              </>
            ) : emailExists ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>
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
          
          @keyframes checkmarkIn {
            from {
              opacity: 0;
              transform: translateY(-50%) scale(0);
            }
            to {
              opacity: 1;
              transform: translateY(-50%) scale(1);
            }
          }
          
          /* Prevent browser autofill from changing input styles */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px var(--color-bg) inset !important;
            -webkit-text-fill-color: var(--color-text) !important;
            box-shadow: 0 0 0 1000px var(--color-bg) inset !important;
            background-color: var(--color-bg) !important;
            border: 0.0625rem solid var(--color-border) !important;
            transition: background-color 5000s ease-in-out 0s !important;
          }
          
          /* Remove focus outline on all inputs */
          input:focus,
          input:focus-visible {
            outline: none !important;
            border: 0.0625rem solid var(--color-border) !important;
          }
        `}</style>
    </div>
  );
};

export default Auth;
