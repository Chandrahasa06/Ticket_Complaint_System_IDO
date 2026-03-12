import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AccessDenied = ({ message }) => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  console.log(token);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.message}>{message || "You don't have permission to view this page."}</p>

        <button
          onClick={() => navigate("/")}
          style={styles.button}
          onMouseEnter={e => {
            e.target.style.background = "#1a1a2e";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            e.target.style.background = "#2d2d44";
            e.target.style.transform = "translateY(0)";
          }}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f5f5f0 0%, #ebebea 100%)",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "4px",
    padding: "56px 48px",
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 2px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  icon: {
    width: "48px",
    height: "48px",
    color: "#c0392b",
    opacity: 0.85,
  },
  title: {
    fontSize: "26px",
    fontWeight: "400",
    color: "#1a1a1a",
    margin: "0 0 12px 0",
    letterSpacing: "-0.3px",
  },
  message: {
    fontSize: "15px",
    color: "#666",
    lineHeight: "1.6",
    margin: "0 0 36px 0",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: "400",
  },
  button: {
    display: "inline-block",
    padding: "12px 28px",
    background: "#2d2d44",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    fontSize: "14px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: "500",
    letterSpacing: "0.3px",
    cursor: "pointer",
    transition: "background 0.2s ease, transform 0.15s ease",
  },
};

export default AccessDenied;