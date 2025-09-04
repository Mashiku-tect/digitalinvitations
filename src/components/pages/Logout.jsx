import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove token
    localStorage.removeItem("token");

    // Redirect to login
    navigate("/", { replace: true });
  }, [navigate]);

  return null; // no UI, just logic
};

export default Logout;
