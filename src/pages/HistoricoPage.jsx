import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HistoricoPage.css';

function HistoricoPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([
    { 
      id: 1, 
      date: '15 de Outubro, 2025', 
      type: 'Sessão Online', 
      status: 'Concluída',
      summary: 'Exercícios de dicção realizados com sucesso.' 
    },
    { 
      id: 2, 
      date: '01 de Outubro, 2025', 
      type: 'Avaliação Presencial', 
      status: 'Concluída',
      summary: 'Avaliação inicial e planejamento do tratamento.' 
    },
    { 
      id: 3, 
      date: '20 de Setembro, 2025', 
      type: 'Sessão Online', 
      status: 'Cancelada',
      summary: 'Paciente remarcou por motivos pessoais.' 
    },
  ]);

  return (
    <div className="historico-page-wrapper">
      <div className="historico-container">
        
        <header className="historico-header">
          <h1>Histórico de Consultas</h1>
          <button 
            className="back-button" 
            onClick={() => navigate('/chat')}
          >
            Voltar ao Chat
          </button>
        </header>

        <div className="history-list">
          {history.map(item => (
            <div key={item.id} className="history-card">
              <div className="history-header">
                <span className="history-date">{item.date}</span>
                <span className={`history-status ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              <div className="history-details">
                <strong>{item.type}</strong>
                <p>{item.summary}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default HistoricoPage;