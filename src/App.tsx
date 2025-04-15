// App.tsx - Componente principal
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import "./App.css";

interface ConnectionInfo {
  server: string;
  username: string;
  password: string;
  database?: string;
  authenticated: boolean;
}

function App() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    server: "",
    username: "",
    password: "",
    authenticated: false,
  });

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/login"
            element={
              <LoginPage
                onLogin={(info) =>
                  setConnectionInfo({ ...info, authenticated: true })
                }
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              connectionInfo.authenticated ? (
                <Dashboard connectionInfo={connectionInfo} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
