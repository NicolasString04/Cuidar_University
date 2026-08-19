import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Pessoas from "./pages/Pessoas";
import Atendimentos from "./pages/Atendimentos";
import Usuario from "./pages/Usuario";
import Supervisao from "./pages/Supervisao";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/pessoas"
        element={<Pessoas />}
      />

      <Route
        path="/atendimentos"
        element={<Atendimentos />}
      />

      <Route
        path="/usuario"
        element={<Usuario />}
      />

      <Route
        path="/supervisao"
        element={<Supervisao />}
      />

<Route
  path="/login"
  element={<Login />}
/>

    </Routes>
  );
}

export default App;