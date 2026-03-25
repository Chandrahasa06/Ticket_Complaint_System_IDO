import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccessDenied from "../pages/AccessDenied";

const ProtectedRoute = ({ children, roles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      fetch("http://localhost:3000/protectedRoute", {
        credentials: "include"
      })
        .then((res) => {
          if (res.status === 401) {
            navigate("/");
            return;
          }
          return res.json();
        })
        .then((data) => {
          if (data) setUser(data);
          setLoading(false);
        })
        .catch(() => navigate("/"));
    };

    checkAuth(); // initial check
    const interval = setInterval(checkAuth, 5000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  if (!user) {
    return <AccessDenied message="Login required to access this page." />;
  }

  if (roles && !roles.includes(user.role)) {
    return <AccessDenied message="You are not authorized to access this page." />;
  }

  return children;
};

export default ProtectedRoute;