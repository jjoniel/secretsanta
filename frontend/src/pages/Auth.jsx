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
    return Math.floor(Math.random() * 360);
  };

  const [fallingIcons, setFallingIcons] = useState([]);
  const [showAccountFoundFlash, setShowAccountFoundFlash] = useState(false);

  useEffect(() => {
    if (gameType === "santa" || gameType === "assassins") {
      // Generate falling icons spaced across page width with no overlap
      const generateFallingIcons = () => {
        const items = [];
        const viewportWidth =
          typeof window !== "undefined" ? window.innerWidth : 1920;
        const remInPx = 16; // 1rem = 16px

        // Icon sizes: santa hats are 4rem, water guns are 3rem
        const iconWidth = gameType === "santa" ? 4 : 3; // in rem
        const iconWidthPx = iconWidth * remInPx;
        const gapPx = 1 * remInPx; // 1rem gap minimum

        // Calculate how many icons can fit
        const spacingNeeded = iconWidthPx + gapPx;
        const maxIcons = Math.floor(viewportWidth / spacingNeeded);

        // Generate unique x positions with proper spacing
        const usedXPositions = new Set();
        const xPositions = [];

        for (let i = 0; i < maxIcons; i++) {
          let x;
          let attempts = 0;
          do {
            // Try to place icon at calculated position with some randomness
            const baseX = i * spacingNeeded;
            const randomOffset =
              Math.random() * (spacingNeeded - iconWidthPx - gapPx);
            x = Math.floor(baseX + randomOffset);
            attempts++;
          } while (usedXPositions.has(x) && attempts < 100);

          if (!usedXPositions.has(x)) {
            usedXPositions.add(x);
            xPositions.push(x);
          }
        }

        // Create items with unique x positions
        xPositions.forEach((x, i) => {
          items.push({
            id: `icon-${i}`,
            x: x,
            rotation: getRandomRotation(),
            animationDuration: 8 + Math.random() * 10, // Random speed between 8-18 seconds
            animationDelay: -(Math.random() * (8 + Math.random() * 10)), // Negative delay to start mid-cycle
            rotationSpeed: 2 + Math.random() * 4, // Random rotation speed between 2-6 seconds per full rotation
          });
        });

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

  // Flash the email field when an account is found
  useEffect(() => {
    if (emailExists === true) {
      setShowAccountFoundFlash(true);
      const timeoutId = setTimeout(() => {
        setShowAccountFoundFlash(false);
      }, 1500);
      return () => clearTimeout(timeoutId);
    } else {
      setShowAccountFoundFlash(false);
    }
  }, [emailExists]);

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
                  animation: `rotate ${item.rotationSpeed}s linear infinite`,
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
                  width: "3rem",
                  height: "3rem",
                  backgroundImage: `url(${watergunImage})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  opacity: 0.15,
                  transform: `rotate(${item.rotation}deg)`,
                  animation: `rotate ${item.rotationSpeed}s linear infinite`,
                  "--initial-rotation": `${item.rotation}deg`,
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
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 700,
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
            textAlign: "center",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          exchan.ge
        </h1>

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
                  ? "rgba(249, 115, 115, 1)"
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
                e.currentTarget.style.color = "var(--color-accent)";
              }
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
          >
            <FaGift
              style={{
                fontSize: "1rem",
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
                  ? "var(--color-accent)"
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
                e.currentTarget.style.color = "var(--color-accent)";
              }
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
          >
            <FaCrosshairs
              style={{
                fontSize: "1rem",
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
              {showAccountFoundFlash && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "9999px",
                    backgroundColor: "var(--color-success)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    pointerEvents: "none",
                    animation: "emailFoundFlash 1.5s ease-out forwards",
                  }}
                >
                  account found!
                </div>
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
            transition: "opacity 0.5s",
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
          
          @keyframes rotate {
            from {
              transform: rotate(var(--initial-rotation, 0deg));
            }
            to {
              transform: rotate(calc(var(--initial-rotation, 0deg) + 360deg));
            }
          }
          
          @keyframes emailFoundFlash {
            0% {
              opacity: 0;
              transform: scale(0.98);
            }
            10% {
              opacity: 1;
              transform: scale(1);
            }
            90% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(0.98);
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
