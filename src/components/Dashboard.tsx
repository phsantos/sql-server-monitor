import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QueryMonitor from "./QueryMonitor";
import LockViewer from "./LockViewer";
import "../styles/Dashboard.css";

interface ConnectionInfo {
  server: string;
  username: string;
  password: string;
  database?: string;
  authenticated: boolean;
}

interface DashboardProps {
  connectionInfo: ConnectionInfo;
}

const Dashboard: React.FC<DashboardProps> = ({ connectionInfo }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"queries" | "locks">("queries");
  const [isConnected, setIsConnected] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="connection-info">
          <h2>SQL Server Monitor</h2>
          <span>Conectado a: {connectionInfo.server}</span>
        </div>
        <div className="dashboard-actions">
          <div className="refresh-control">
            <label htmlFor="refresh">Atualizar a cada:</label>
            <select
              id="refresh"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={2}>2 segundos</option>
              <option value={5}>5 segundos</option>
              <option value={10}>10 segundos</option>
              <option value={30}>30 segundos</option>
              <option value={60}>1 minuto</option>
            </select>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Sair
          </button>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button
          className={activeTab === "queries" ? "active" : ""}
          onClick={() => setActiveTab("queries")}
        >
          Consultas Ativas
        </button>
        <button
          className={activeTab === "locks" ? "active" : ""}
          onClick={() => setActiveTab("locks")}
        >
          Bloqueios (Locks)
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "queries" && (
          <QueryMonitor
            connectionInfo={connectionInfo}
            refreshInterval={refreshInterval}
          />
        )}

        {activeTab === "locks" && (
          <LockViewer
            connectionInfo={connectionInfo}
            refreshInterval={refreshInterval}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
