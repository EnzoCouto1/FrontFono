// Em: src/pages/HistoricoPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import './HistoricoPage.css';

function HistoricoPage() {
    const navigate = useNavigate();
    
    // Estado inicial vazio (será preenchido pela API)
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função auxiliar para buscar nome do especialista
    const getSpecialistName = useCallback(async (especialistaId) => {
        try {
            const response = await api.get(`/especialistas/${especialistaId}`);
            return response.data.nome;
        } catch (e) {
            return 'Especialista';
        }
    }, []);

    // Buscar Histórico
    useEffect(() => {
        const fetchHistory = async () => {
            const userId = localStorage.getItem('userId');
            
            if (!userId) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get(`/consultas/cliente/${userId}`);
                
                // Filtra e processa os dados
                const processedHistory = await Promise.all(
                    response.data
                        // Filtra tudo que NÃO é "AGENDADA" (ou seja, já passou ou foi cancelada)
                        // Ou você pode filtrar por data < hoje
                        .filter(c => c.status !== 'AGENDADA') 
                        .map(async (c) => ({
                            id: c.id,
                            date: c.data,
                            time: c.hora,
                            type: c.tipo,
                            status: c.status, // "CONCLUÍDA", "CANCELADA", etc.
                            specialist: await getSpecialistName(c.especialistaId)
                        }))
                );
                
                // Ordena: Mais recentes primeiro
                processedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

                setHistory(processedHistory);

            } catch (err) {
                console.error("Erro ao buscar histórico:", err);
                setError("Erro ao carregar histórico.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [getSpecialistName]);

    // Renderização
    return (
        <div className="historico-page-wrapper">
            <div className="historico-container">
                
                <header className="historico-header">
                    <h1>Histórico de Consultas</h1>
                    <button className="historico-back-button" onClick={() => navigate('/chat')}>
                        Voltar
                    </button>
                </header>

                <div className="history-list">
                    {isLoading ? (
                        <p style={{textAlign: 'center', color: '#888'}}>Carregando histórico...</p>
                    ) : error ? (
                        <p style={{textAlign: 'center', color: '#ff4757'}}>{error}</p>
                    ) : history.length === 0 ? (
                         <div className="empty-history-message">
                            <p>Nenhum registro encontrado.</p>
                         </div>
                    ) : (
                        history.map(item => (
                            <div key={item.id} className={`history-card ${item.status.toLowerCase()}`}>
                                <div className="history-info">
                                    <div className="history-main">
                                        <span className="history-type">{item.type}</span>
                                        <span className="history-specialist">{item.specialist}</span>
                                    </div>
                                    <div className="history-meta">
                                        <span className="history-date">
                                            {new Date(item.date).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span className="history-time">
                                            {item.time ? item.time.substring(0, 5) : ''}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Badge de Status */}
                                <div className="status-badge">
                                    {item.status}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}

export default HistoricoPage;