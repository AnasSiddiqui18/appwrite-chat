import { Outlet, Navigate } from "react-router-dom";
import { Store } from "./Store";

const PrivateRoutes = () => {
  const storedToken = localStorage.getItem("token");

  return (
    <>
      {Store.user !== null || storedToken ? (
        <Outlet />
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
};

export default PrivateRoutes;
