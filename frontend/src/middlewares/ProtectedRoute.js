import { useEffect, useState } from "react";
import AccessDenied from "../pages/AccessDenied";

const ProtectedRoute = ({ children, roles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/protectedRoute", {
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(false);
        setLoading(false);
      });
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