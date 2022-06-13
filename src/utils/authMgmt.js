import { useLocation, Navigate } from "react-router-dom";
import Userfront from "@userfront/react";

import { toast } from "react-toastify";

const RequireAuth = ({ children }) => {
  let location = useLocation();
  if (!Userfront.tokens.accessToken) {
    toast.error("먼저 로그인해주세요.", { toastId: "loginFirst" });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export { RequireAuth };
