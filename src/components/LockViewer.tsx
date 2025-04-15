import React, { useState, useEffect } from 'react';
import '../styles/LockViewer.css';

interface LockData {
  spid: number;
  blockingSpid: number;
  databaseName: string;
  objectName: string;
  lockType: string;
  lockMode: string;
  status: string;
  waitTime: number;
  loginName: string;
  hostname: string;
  programName: string;
  queryText: string;
}

interface LockViewerProps {
  connectionInfo: {
    server: string;
    username: string;
    password: string;
    database?: string;
  };
  refreshInterval: number;
}

const LockViewer: React.FC<LockViewerProps> = ({ connectionInfo, refreshInterval }) => {
  const [locks, setLocks] = useState<LockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLock, setSelectedLock] = useState<LockData | null>(null);

  // Simular a obtenção de dados de bloqueios do SQL Server
  const fetchLocks = async () => {
    setLoading(true);
    try {
      // Em uma implementação real, aqui seria feito um fetch para o backend
      // que consultaria o SQL Server usando DMVs como sys.dm_tran_locks
      
      // Dados de exemplo
      const mockData: LockData[] = [
        {
          spid: 54,
          blockingSpid: 0,
          databaseName: 'Vendas',
          objectName: 'Clientes',
          lockType: 'OBJECT',
          lockMode: 'IX',
          status: 'GRANT',
          waitTime: 0,
          loginName: 'sa',
          hostname: 'WORKSTATION1',
          programName: 'Microsoft SQL Server Management Studio',
          queryText: 'UPDATE Clientes SET UltimoContato = GETDATE() WHERE ClienteID = 5423'
        },
        {
          spid: 57,
          blockingSpid: 54,
          databaseName: 'Vendas',
          objectName: 'Clientes',
          lockType: 'OBJECT',
          lockMode: 'S',
          status: 'WAIT',
          waitTime: 15000,
          loginName: 'app_user',
          hostname: 'APP-SERVER',
          programName: 'MyApplication',
          queryText: 'SELECT * FROM Clientes WHERE ClienteID = 5423'
        },
        {
          spid: 60,
          blockingSpid: 54,
          databaseName: 'Vendas',
          objectName: 'Clientes',
          lockType: 'PAGE',
          lockMode: 'IS',
          status: 'WAIT',
          waitTime: 10000,
          loginName: 'report_user',
          hostname: 'REPORT-SERVER',
          programName: 'ReportEngine',
          queryText: 'SELECT * FROM Clientes WHERE Estado = 'SP''
        }
      ];
      
      setLocks(mockData);
      setError(null);
    } catch (err) {
      setError('Erro ao buscar dados de bloqueios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocks();
    
    const intervalId = setInterval(fetchLocks, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  const handleKillProcess = async (spid: number) => {
    if (!confirm(`Tem certeza que deseja encerrar o processo SPID ${spid}?`)) {
      return;
    }
    
    try {
      // Em uma implementação real, aqui seria feito um fetch para o backend
      // que executaria o comando KILL no SQL Server
      console.log(`Matando processo ${spid}`);
      
      // Simular uma resposta bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualizar a lista de bloqueios
      setLocks(prev => prev.filter(l => l.spid !== spid));
      
      if (selectedLock?.spid === spid) {
        setSelectedLock(null);
      }
      
      alert(`Processo ${spid} finalizado com sucesso.`);
    } catch (err) {
      alert(`Erro ao tentar finalizar o processo ${spid}.`);
    }
  };

  // Criar um mapa de bloqueios para visualizar a árvore de bloqueios
  const blockingTree: Record<number, number[]> = {};
  locks.forEach(lock => {
    if (lock.blockingSpid > 0) {
      if (!blockingTree[lock.blockingSpid]) {
        blockingTree[lock.blockingSpid] = [];
      }
      blockingTree[lock.blockingSpid].push(lock.spid);
    }
  });

  // Identificar os processos "raiz" que estão bloqueando outros, mas não são bloqueados
  const rootBlockers = locks.filter(lock => {
    return blockingTree[lock.spid] && !locks.some(l => l.spid === lock.blockingSpid);
  });

  // Função recursiva para renderizar a árvore de bloqueios
  const renderBlockingTree = (spid: number, level: number = 0) => {
    const lock = locks.find(l => l.spid === spid);
    if (!lock) return null;
    
    const blockedProcesses = blockingTree[spid] || [];
    
    return (
      <div key={spid} className="lock-tree-item" style={{ marginLeft: `${level * 20}px` }}>
        <div 
          className={`lock-node ${blockedProcesses.length > 0 ? 'blocker' : ''}`}
          onClick={() => setSelectedLock(lock)}
        >
          <span className="spid">SPID: {spid}</span>
          <span className="lock-info">
            {lock.lockMode} on {lock.objectName} ({lock.waitTime > 0 ? `Aguardando: ${lock.waitTime}ms` : 'Ativo'})
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleKillProcess(spid);
            }}
            className="kill-btn-small"
          >
            Finalizar
          </button>
        </div>
        
        {blockedProcesses.map(blockedSpid => renderBlockingTree(blockedSpid, level + 1))}
      </div>
    );
  };

  return (
    <div className="lock-viewer">
      <div className="toolbar">
        <h3>Visualização de Bloqueios (Locks)</h3>
        <button onClick={fetchLocks} className="refresh-btn">
          Atualizar Agora
        </button>
      </div>
      
      {loading && <div className="loading">Carregando dados de bloqueios...</div>}
      
      {error && <div className="error">{error}</div>}
      
      <div className="lock-container">
        <div className="lock-tree">
          <h4>Árvore de Bloqueios</h4>
          {rootBlockers.length > 0 ? (
            rootBlockers.map(blocker => renderBlockingTree(blocker.spid))
          ) : (
            <div className="no-locks">Não há bloqueios ativos no momento</div>
          )}
        </div>
        
        <div className="lock-list">
          <h4>Lista de Bloqueios</h4>
          <table className="locks-table">
            <thead>
              <tr>
                <th>SPID</th>
                <th>Bloqueando</th>
                <th>Objeto</th>
                <th>Tipo</th>
                <th>Modo</th>
                <th>Status</th>
                <th>Tempo (ms)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {locks.map(lock => (
                <tr 
                  key={`${lock.spid}-${lock.objectName}-${lock.lockType}`}
                  onClick={() => setSelectedLock(lock)}
                  className={blockingTree[lock.spid] ? 'blocker' : lock.blockingSpid > 0 ? 'blocked' : ''}
                >
                  <td>{lock.spid}</td>
                  <td>{blockingTree[lock.spid] ? 'Sim' : 'Não'}</td>
                  <td>{lock.objectName}</td>
                  <td>{lock.lockType}</td>
                  <td>{lock.lockMode}</td>
                  <td>{lock.status}</td>
                  <td>{lock.waitTime}</td>
                  <td>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKillProcess(lock.spid);
                      }}
                      className="kill-btn"
                    >
                      Finalizar
                    </button>
                  </td>
                </tr>
              ))}
              {locks.length === 0 && (
                <tr>
                  <td colSpan={8} className="no-data">Nenhum bloqueio encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedLock && (
        <div className="lock-details">
          <div className="lock-details-header">
            <h3>Detalhes do Bloqueio (SPID: {selectedLock.spid})</h3>
            <button onClick={() => setSelectedLock(null)} className="close-btn">×</button>
          </div>
          <div className="lock-details-content">
            <div className="lock-detail-item">
              <strong>Hostname:</strong> {selectedLock.hostname}
            </div>
            <div className="lock-detail-item">
              <strong>Aplicação:</strong> {selectedLock.programName}
            </div>
            <div className="lock-detail-item">
              <strong>Login:</strong> {selectedLock.loginName}
            </div>
            <div className="lock-detail-item">
              <strong>Banco de Dados:</strong> {selectedLock.databaseName}
            </div>
            <div className="lock-detail-item">
              <strong>Tipo de Bloqueio:</strong> {selectedLock.lockType}
            </div>
            <div className="lock-detail-item">
              <strong>Modo de Bloqueio:</strong> {selectedLock.lockMode}
            </div>
            <div className="lock-detail-item">
              <strong>Status:</strong> {selectedLock.status}
            </div>
            <div className="lock-detail-item">
              <strong>Tempo de Espera:</strong> {selectedLock.waitTime} ms
            </div>
            <div className="lock-sql">
              <strong>SQL:</strong>
              <pre>{selectedLock.queryText}</pre>
            </div>
          </div>
          <div className="lock-details-footer">
            <button 
              onClick={() => handleKillProcess(selectedLock.spid)}
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

export default LockViewer;