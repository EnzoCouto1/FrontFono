import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './SpecialistPage.css';

function SpecialistPage() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Chat selecionado para ver
  const [chatMessages, setChatMessages] = useState([]); // Mensagens desse chat
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) { navigate('/login'); return; }
      try {
        const response = await api.get(`/chats/especialista/${userId}`);
        const chatsWithNames = await Promise.all(response.data.map(async (chat) => {
          try {
             const clientResp = await api.get(`/clientes/${chat.clienteId}`);
             return { ...chat, clienteNome: clientResp.data.nome, clienteNivel: clientResp.data.nivel };
          } catch (e) { return { ...chat, clienteNome: 'Paciente', clienteNivel: '-' }; }
        }));
        setChats(chatsWithNames);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchChats();
  }, [navigate]);

  // Abrir modal e carregar conversa
  const handleOpenChat = (chat) => {
      setSelectedChat(chat);
      // A conversa vem como string JSON do banco, precisamos fazer parse
      try {
          const parsed = JSON.parse(chat.conversa);
          setChatMessages(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
          setChatMessages([]); // Se der erro ou estiver vazio
      }
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Excluir histórico?")) {
        try {
            await api.delete(`/chats/${chatId}`);
            setChats(prev => prev.filter(c => c.id !== chatId));
        } catch (e) { alert("Erro ao deletar."); }
    }
  };

  return (
    <div className="specialist-wrapper">
      <div className="specialist-container">
          <header className="specialist-header">
            <h1>Painel do Especialista</h1>
            <button className="logout-btn-header" onClick={() => navigate('/login')}>Sair</button>
          </header>

          <div className="dashboard-content">
            <h2>Pacientes Ativos</h2>
            {isLoading ? <p className="loading-text">Carregando...</p> : (
                <div className="chats-grid">
                    {chats.length === 0 ? <p>Sem pacientes.</p> : chats.map(chat => (
                        <div key={chat.id} className="patient-card">
                            <div className="card-header">
                                <div className="patient-avatar">{chat.clienteNome.charAt(0)}</div>
                                <div className="patient-info">
                                    <h3>{chat.clienteNome}</h3>
                                    <span className="patient-level">{chat.clienteNivel}</span>
                                </div>
                            </div>
                            <div className="card-stats">
                                <p><strong>Mensagens:</strong> {chat.duracao}</p> {/* Usamos duracao como contador */}
                            </div>
                            <div className="card-actions">
                                <button className="btn-report" onClick={() => handleOpenChat(chat)}>
                                    📄 Ver Conversa
                                </button>
                                <button className="btn-delete" onClick={() => handleDeleteChat(chat.id)}>
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* MODAL DE VISUALIZAÇÃO DA CONVERSA */}
          {selectedChat && (
              <div className="report-modal">
                  <div className="report-content" style={{width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
                      <div className="modal-header">
                        <h3>Histórico: {selectedChat.clienteNome}</h3>
                        <button className="close-modal-btn" onClick={() => setSelectedChat(null)}>&times;</button>
                      </div>
                      
                      <div className="modal-body-chat">
                          {chatMessages.length === 0 ? <p>Sem mensagens registradas.</p> : chatMessages.map(msg => (
                              <div key={msg.id} className={`msg-item ${msg.sender}`}>
                                  <div className="msg-bubble-spec">
                                      {msg.targetText && <small className="msg-target">Treino: {msg.targetText}</small>}
                                      <p>{msg.type === 'audio' ? '[Áudio Enviado]' : msg.content}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                      
                      <div className="modal-footer">
                        <button className="btn-close-main" onClick={() => setSelectedChat(null)}>Fechar</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}

export default SpecialistPage;