// import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PrivateRoutes from "./lib/utils/PrivateRoutes";
import Room from "./pages/Room";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Home from "./pages/Home";
// import { AuthProvider } from "./utils/AuthContext";

function App() {
  return (
    <Router>
      {/* <AuthProvider> */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/room/:id" element={<Room />} />
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>

      {/* </AuthProvider> */}
    </Router>
  );
}

export default App;
