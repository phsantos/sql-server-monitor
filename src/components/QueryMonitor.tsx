import React, { useState, useEffect } from 'react';
import '../styles/QueryMonitor.css';

interface QueryData {
  sessionId: number;
  status: string;
  blockingSessionId: number;
  waitTime: number;
  cpuTime: number;
  elapsedTime: number;
  reads: number;
  writes: number;
  loginName: string;
  hostname: string;
  programName: string;
  databaseName: string;
  queryText: string;
}

interface QueryMonitorProps {
  connectionInfo: {
    server: string;
    username: string;
    password: string;
    database?: string;
  };
  refreshInterval: number;
}

const QueryMonitor: React.FC<QueryMonitorProps> = ({ connectionInfo, refreshInterval }) => {
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<QueryData | null>(null);
  const [sortField, setSortField] = useState<keyof QueryData>('elapsedTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterText, setFilterText] = useState('');

  // Simular a obtenção de dados do SQL Server
  const fetchQueries = async () => {
    setLoading(true);
    try {
      // Em uma implementação real, aqui seria feito um fetch para o backend
      // que consultaria o SQL Server usando DMVs como sys.dm_exec_requests e sys.dm_exec_sql_text
      
      // Dados de exemplo
      const mockData: QueryData[] = [
        {
          sessionId: 54,
          status: 'running',
          blockingSessionId: 0,
          waitTime: 0,
          cpuTime: 12345,
          elapsedTime: 65432,
          reads: 45678,
          writes: 1234,
          loginName: 'sa',
          hostname: 'WORKSTATION1',
          programName: 'Microsoft SQL Server Management Studio',
          databaseName: 'Vendas',
          queryText: 'SELECT * FROM Clientes c JOIN Pedidos p ON c.ClienteID = p.ClienteID WHERE p.DataPedido > '2023-01-01''
        },
        {
          sessionId: 57,
          status: 'suspended',
          blockingSessionId: 54,
          waitTime: 15000,
          cpuTime: 5432,
          elapsedTime: 30123,
          reads: 12345,
          writes: 0,
          loginName: 'app_user',
          hostname: 'APP-SERVER',
          programName: 'MyApplication',
          databaseName: 'Vendas',
          queryText: 'UPDATE Clientes SET UltimoContato = GETDATE() WHERE ClienteID = 5423'
        },
        {
          sessionId: 62,
          status: 'running',
          blockingSessionId: 0,
          waitTime: 0,
          cpuTime: 87654,
          elapsedTime: 120000,
          reads: 986543,
          writes: 0,
          loginName: 'report_user',
          hostname: 'REPORT-SERVER',
          programName: 'ReportEngine',
          databaseName: 'Vendas',
          queryText: 'SELECT p.ProdutoID, p.Nome, SUM(i.Quantidade) as QuantidadeVendida FROM Produtos p JOIN ItemPedido i ON p.ProdutoID = i.ProdutoID GROUP BY p.ProdutoID, p.Nome ORDER BY QuantidadeVendida DESC'
        }
      ];
      
      setQueries(mockData);
      setError(null);
    } catch (err) {
      setError('Erro ao buscar dados de consultas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
    
    const intervalId = setInterval(fetchQueries, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  const handleSort = (field: keyof QueryData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedQueries = [...queries].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aString.localeCompare(bString);
    } else {
      return bString.localeCompare(aString);
    }
  });

  const filteredQueries = sortedQueries.filter(query => {
    if (!filterText) return true;
    const searchTerm = filterText.toLowerCase();
    
    return (
      query.loginName.toLowerCase().includes(searchTerm) ||
      query.hostname.toLowerCase().includes(searchTerm) ||
      query.programName.toLowerCase().includes(searchTerm) ||
      query.databaseName.toLowerCase().includes(searchTerm) ||
      query.queryText.toLowerCase().includes(searchTerm) ||
      query.sessionId.toString().includes(searchTerm)
    );
  });

  const handleKillProcess = async (sessionId: number) => {
    if (!confirm(`Tem certeza que deseja encerrar o processo SPID ${sessionId}?`)) {
      return;
    }
    
    try {
      // Em uma implementação real, aqui seria feito um fetch para o backend
      // que executaria o comando KILL no SQL Server
      console.log(`Matando processo ${sessionId}`);
      
      // Simular uma resposta bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualizar a lista de consultas
      setQueries(prev => prev.filter(q => q.sessionId !== sessionId));
      
      if (selectedQuery?.sessionId === sessionId) {
        setSelectedQuery(null);
      }
      
      alert(`Processo ${sessionId} finalizado com sucesso.`);
    } catch (err) {
      alert(`Erro ao tentar finalizar o processo ${sessionId}.`);
    }
  };

  return (
    <div className="query-monitor">
      <div className="toolbar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Filtrar consultas..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button onClick={fetchQueries} className="refresh-btn">
          Atualizar Agora
        </button>
      </div>
      
      {loading && <div className="loading">Carregando consultas...</div>}
      
      {error && <div className="error">{error}</div>}
      
      <div className="queries-table-container">
        <table className="queries-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('sessionId')}>
                SPID {sortField === 'sessionId' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('blockingSessionId')}>
                Bloqueado por {sortField === 'blockingSessionId' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('elapsedTime')}>
                Tempo (ms) {sortField === 'elapsedTime' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('cpuTime')}>
                CPU (ms) {sortField === 'cpuTime' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('reads')}>
                Leituras {sortField === 'reads' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('writes')}>
                Escritas {sortField === 'writes' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('databaseName')}>
                Banco {sortField === 'databaseName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('loginName')}>
                Login {sortField === 'loginName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueries.map(query => (
              <tr 
                key={query.sessionId} 
                onClick={() => setSelectedQuery(query)}
                className={query.blockingSessionId > 0 ? 'blocking' : ''}
              >
                <td>{query.sessionId}</td>
                <td>{query.status}</td>
                <td>{query.blockingSessionId > 0 ? query.blockingSessionId : '-'}</td>
                <td>{query.elapsedTime}</td>
                <td>{query.cpuTime}</td>
                <td>{query.reads}</td>
                <td>{query.writes}</td>
                <td>{query.databaseName}</td>
                <td>{query.loginName}</td>
                <td>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleKillProcess(query.sessionId);
                    }}
                    className="kill-btn"
                  >
                    Finalizar
                  </button>
                </td>
              </tr>
            ))}
            {filteredQueries.length === 0 && (
              <tr>
                <td colSpan={10} className="no-data">Nenhuma consulta encontrada</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedQuery && (
        <div className="query-details">
          <div className="query-details-header">
            <h3>Detalhes da Consulta (SPID: {selectedQuery.sessionId})</h3>
            <button onClick={() => setSelectedQuery(null)} className="close-btn">×</button>
          </div>
          <div className="query-details-content">
            <div className="query-detail-item">
              <strong>Hostname:</strong> {selectedQuery.hostname}
            </div>
            <div className="query-detail-item">
              <strong>Aplicação:</strong> {selectedQuery.programName}
            </div>
            <div className="query-detail-item">
              <strong>Login:</strong> {selectedQuery.loginName}
            </div>
            <div className="query-detail-item">
              <strong>Banco de Dados:</strong> {selectedQuery.databaseName}
            </div>
            <div className="query-sql">
              <strong>SQL:</strong>
              <pre>{selectedQuery.queryText}</pre>
            </div>
          </div>
          <div className="query-details-footer">
            <button 
              onClick={() => handleKillProcess(selectedQuery.sessionId)}
              className="kill-btn-large"
            >
              Finalizar Processo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryMonitor;