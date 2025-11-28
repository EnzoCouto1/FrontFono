import api from '../api/axiosConfig';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

const loadInitialMessages = () => {
  const savedMessages = localStorage.getItem('chatMessages_v2'); // Mudei a chave para limpar cache antigo
  if (savedMessages) {
    try { return JSON.parse(savedMessages); } catch (e) { console.error(e); }
  }
  return [{ id: 1, type: 'text', content: 'Olá! Digite a palavra que quer treinar abaixo e grave seu áudio.', sender: 'received', timestamp: new Date() }];
};

function ChatPage() {
  // --- ESTADOS ---
  const [messages, setMessages] = useState(loadInitialMessages);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Estado para a mensagem de texto normal (Chat)
  const [newMessage, setNewMessage] = useState('');
  
  // NOVO: Estado para a palavra que o usuário vai treinar no áudio
  const [practiceText, setPracticeText] = useState('rato, carro, terra');
  
  const [isRecording, setIsRecording] = useState(false);
  
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const messageListRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- EFEITOS ---
  // Pega o ID do usuário para salvar histórico separado
  const userId = localStorage.getItem('userId');
  const storageKey = `chatMessages_${userId}`;

  useEffect(() => {
    if (userId) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, userId, storageKey]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // --- FUNÇÕES DE CHAT ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    setMessages(prev => [...prev, {
      id: Date.now(), type: 'text', content: newMessage, sender: 'sent', timestamp: new Date()
    }]);
    setNewMessage('');
  };

  const handleDeleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    navigate('/');
  };

  // --- LÓGICA DE ÁUDIO (DEEPGRAM) ---
  const handleAudioRecording = async () => {
    // Validação básica
    if (!practiceText.trim()) {
        alert("Digite as palavras que você vai falar no campo 'Treino' antes de gravar!");
        return;
    }

    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Chrome usa WebM
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Mostra o áudio no chat imediatamente
          setMessages(prev => [...prev, {
            id: Date.now(), 
            type: 'audio', 
            content: audioUrl, 
            sender: 'sent', 
            timestamp: new Date(), 
            targetText: practiceText // Salvamos o que o usuário tentou falar
          }]);

          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.wav');
          // AGORA É DINÂMICO: Envia o que estiver escrito no input de treino
          formData.append('palavrasEsperadas', practiceText); 

          try {
            // Envia sem token (rota pública para teste)
            const response = await api.post('/api/pronunciation/analyze-batch-deepgram', formData, {
              headers: { 'Content-Type': 'multipart/form-data', 'Authorization': '' },
            });

            const aiFeedback = {
              id: Date.now() + 1, 
              type: 'text', 
              sender: 'received', 
              timestamp: new Date(),
              content: `📊 Resultado para: "${practiceText}"\nNota: ${response.data.pontuacaoGeral?.toFixed(0)}%\n${response.data.feedbackGeral}`
            };
            setMessages(prev => [...prev, aiFeedback]);
          } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
              id: Date.now() + 2, type: 'text', sender: 'received', content: "Erro ao conectar com a IA.", timestamp: new Date()
            }]);
          }
        };
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        alert("Erro ao acessar microfone.");
      }
    }
  };

  return (
    <div className="chat-page-wrapper">
      
      {/* SIDEBAR */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
            <div className="menu-trigger" onClick={() => setIsSidebarOpen(false)}>☰</div>
            <span className="logo-text">FonoChat</span>
        </div>
        <div className="sidebar-content">
            <div className="new-chat-btn" onClick={handleClearChat}>+ Novo Chat</div>
            <div className="menu-section">
                <p>Navegação</p>
                <ul>
                    <li onClick={() => navigate('/perfil')}>👤 Meu Perfil</li>
                    <li onClick={() => navigate('/agenda')}>📅 Minha Agenda</li>
                    <li onClick={() => navigate('/historico')}>📜 Histórico</li>
                    <li onClick={() => navigate('/config')}>⚙️ Configurações</li>
                </ul>
            </div>
            <div className="menu-footer">
                <button className="logout-btn" onClick={handleLogout}>Sair</button>
            </div>
        </div>
      </div>
  
      {/* ÁREA PRINCIPAL */}
      <div className="chat-layout">
        <header className="chat-top-bar">
            {!isSidebarOpen && <button className="toggle-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>}
            <h2>Assistente de Fala</h2>
            <div className="user-avatar">U</div>
        </header>

        <div className="message-list-container" ref={messageListRef}>
          <div className="messages-wrapper">
            {messages.length === 0 ? (
                <div className="empty-state">
                    <h1>Olá!</h1>
                    <p>Escolha uma palavra, digite no campo de treino e grave seu áudio.</p>
                </div>
            ) : (
                messages.map(message => (
                <div key={message.id} className={`message-row ${message.sender}`}>
                    <div className="message-bubble">
                        {message.targetText && <div className="target-label">Treino: {message.targetText}</div>}
                        
                        {message.type === 'audio' ? (
                            <audio controls src={message.content}></audio>
                        ) : (
                            <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                        )}
                        
                        <span className="message-timestamp">
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {message.sender === 'sent' && (
                             <span className="delete-icon" onClick={() => handleDeleteMessage(message.id)}>&times;</span>
                        )}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
  
        {/* INPUTS (Chat + Treino) */}
        <div className="input-area-wrapper">
            
            {/* CAMPO DE TREINO (Para definir o que vai falar) */}
            <div className="practice-input-container">
                <label>O que você vai falar?</label>
                <input 
                    type="text" 
                    className="practice-input"
                    value={practiceText}
                    onChange={e => setPracticeText(e.target.value)}
                    placeholder="Ex: Porta, Prato, Barco..."
                />
            </div>

            <div className="input-bar">
                <input
                    type="text"
                    placeholder="Digite uma mensagem de texto..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                
                {/* O botão de microfone agora grava com base no 'practiceText' */}
                <button 
                    type="button" 
                    className={`mic-btn ${isRecording ? 'recording' : ''}`} 
                    onClick={handleAudioRecording}
                    title="Gravar Áudio do Treino"
                >
                    {isRecording ? '🟥' : '🎤'}
                </button>
                
                <button type="submit" className="send-btn" onClick={handleSendMessage}>Enviar</button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;