import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"

const AccessDenied = ({ message }) => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  console.log(token);  

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{message}</h2>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer"
        }}
      >
        Back to Login
      </button>
    </div>
  );
};

export default AccessDenied;