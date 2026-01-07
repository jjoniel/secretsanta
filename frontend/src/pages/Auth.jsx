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
  const [gameType, setGameType] = useState("santa"); // 'santa' or 'assassins'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const [fallingIcons, setFallingIcons] = useState([]);

  useEffect(() => {
    if (gameType === "santa" || gameType === "assassins") {
      // Generate 75 falling icons with random x positions and speeds
      const generateFallingIcons = () => {
        const items = [];
        const viewportWidth =
          typeof window !== "undefined" ? window.innerWidth : 1920;

        for (let i = 0; i < 50; i++) {
          items.push({
            id: `icon-${i}`,
            x: (Math.random() * 20 * viewportWidth) / 20, // Random x position across viewport width
            rotation: getRandomRotation(),
            animationDuration: 8 + Math.random() * 10, // Random speed between 8-18 seconds
            animationDelay: -(Math.random() * (8 + Math.random() * 10)), // Negative delay to start mid-cycle
          });
        }
        return items;
      };

      setFallingIcons(generateFallingIcons());

      // Regenerate on window resize
      const handleResize = () => {
        setFallingIcons(generateFallingIcons());
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    } else {
      setFallingIcons([]);
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
      {/* Falling Santa hats */}
      {gameType === "santa" && fallingIcons.length > 0 && (
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
          {fallingIcons.map((item) => (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: `${item.x}px`,
                top: "-2rem",
                animation: `fall ${item.animationDuration}s linear infinite`,
                animationDelay: `${item.animationDelay}s`,
                willChange: "transform",
              }}
            >
              <div
                style={{
                  width: "4rem",
                  height: "4rem",
                  backgroundImage: `url(${hatImage})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  opacity: 0.15,
                  transform: `rotate(${item.rotation}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Falling water guns */}
      {gameType === "assassins" && fallingIcons.length > 0 && (
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
          {fallingIcons.map((item) => (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: `${item.x}px`,
                top: "-2rem",
                animation: `fall ${item.animationDuration}s linear infinite`,
                animationDelay: `${item.animationDelay}s`,
                willChange: "transform",
              }}
            >
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  backgroundImage: `url(${watergunImage})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  opacity: 0.15,
                  transform: `rotate(${item.rotation}deg)`,
                }}
              />
            </div>
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
        {/* Title with transition */}
        <div
          style={{
            position: "relative",
            height: "clamp(3rem, 7vw, 4.5rem)",
            marginBottom: "var(--spacing-xl)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 700,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              textAlign: "center",
              position: "absolute",
              width: "100%",
              opacity: emailExists === true ? 0 : 1,
              transform:
                emailExists === true ? "translateY(-1rem)" : "translateY(0)",
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: "none",
            }}
          >
            exchan.ge
          </h1>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 700,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              textAlign: "center",
              position: "absolute",
              width: "100%",
              opacity: emailExists === true ? 1 : 0,
              transform:
                emailExists === true ? "translateY(0)" : "translateY(1rem)",
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: "none",
            }}
          >
            welcome back
          </h1>
        </div>

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
              }
            }}
            onMouseLeave={(e) => {
              if (gameType !== "santa") {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }
            }}
          >
            <FaGift
              style={{
                fontSize: "1rem",
                color:
                  gameType === "santa"
                    ? "var(--color-accent)"
                    : "var(--color-text)",
              }}
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
              }
            }}
            onMouseLeave={(e) => {
              if (gameType !== "assassins") {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }
            }}
          >
            <FaCrosshairs
              style={{
                fontSize: "1rem",
                color:
                  gameType === "assassins"
                    ? "var(--color-accent)"
                    : "var(--color-text)",
              }}
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
                placeholder="get started with your email"
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
        </form>

        {/* Password Form (Login or Register) - Always present */}
        <form
          onSubmit={handlePasswordSubmit}
          style={{
            width: "100%",
            maxWidth: "20rem",
            marginLeft: "auto",
            marginRight: "auto",
            height: "8rem",
            opacity: emailExists !== null ? 1 : 0,
            pointerEvents: emailExists !== null ? "auto" : "none",
            position: "relative",
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
              autoComplete={emailExists ? "current-password" : "new-password"}
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
          @keyframes fall {
            from {
              transform: translateY(-20vh);
            }
            to {
              transform: translateY(120vh);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0.5;
              transform: translateY(2rem);
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
          
          /* Keep all input fields statically styled - no changes on any interaction */
          input,
          input:focus,
          input:focus-visible,
          input:active,
          input:hover {
            outline: none !important;
            border: 0.0625rem solid var(--color-border) !important;
            background: var(--color-bg) !important;
            background-color: var(--color-bg) !important;
            color: var(--color-text) !important;
            box-shadow: none !important;
            transition: none !important;
          }
          
          /* Aggressive autofill prevention - must override browser defaults */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active,
          input:-webkit-autofill:focus-visible {
            outline: none !important;
            border: 0.0625rem solid var(--color-border) !important;
            background: var(--color-bg) !important;
            background-color: var(--color-bg) !important;
            background-image: none !important;
            color: var(--color-text) !important;
            -webkit-text-fill-color: var(--color-text) !important;
            -webkit-box-shadow: 0 0 0 1000px var(--color-bg) inset !important;
            box-shadow: 0 0 0 1000px var(--color-bg) inset !important;
            transition: background-color 5000s ease-in-out 0s !important;
            -webkit-transition: background-color 5000s ease-in-out 0s !important;
          }
          
        `}</style>
    </div>
  );
};

export default Auth;
