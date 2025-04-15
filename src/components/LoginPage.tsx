import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

interface LoginProps {
  onLogin: (connectionInfo: {
    server: string;
    username: string;
    password: string;
    database?: string;
  }) => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [server, setServer] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Em uma implementação real, aqui teríamos uma chamada API para verificar a conexão
      // Simulando uma verificação de conexão
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Se a conexão for bem-sucedida:
      onLogin({ server, username, password, database });
      navigate("/dashboard");
    } catch (err) {
      setError("Falha na conexão. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>SQL Server Monitor</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="server">Servidor:</label>
            <input
              type="text"
              id="server"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="localhost\SQLEXPRESS"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Usuário:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="database">Banco de Dados (opcional):</label>
            <input
              type="text"
              id="database"
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              placeholder="master"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Conectando..." : "Conectar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
