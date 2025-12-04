import api from '../api/axiosConfig';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

function ChatPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // --- ESTADOS DE NAVEGAÇÃO ---
  const [step, setStep] = useState('SELECTION'); // Começa escolhendo
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [backendChatId, setBackendChatId] = useState(null);

  // --- ESTADOS DO CHAT ---
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [practiceText, setPracticeText] = useState('rato, carro, terra');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const mediaRecorderRef = useRef(null);
  const messageListRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 1. Carregar lista de especialistas ao abrir
  useEffect(() => {
    const fetchSpecialists = async () => {
        try {
            const response = await api.get('/especialistas');
            setSpecialists(response.data);
        } catch (error) {
            console.error("Erro ao buscar especialistas", error);
        }
    };
    fetchSpecialists();
  }, []);

  // 2. Selecionar Especialista e Sincronizar Chat
  const handleSelectSpecialist = async (specialist) => {
    setSelectedSpecialist(specialist);
    
    try {
        // Tenta criar o chat (o back-end já verifica se existe e retorna o antigo se for o caso)
        const chatPayload = {
            clienteId: parseInt(userId),
            especialistaId: specialist.id,
            duracao: 0,
            conversa: "[]" // Inicia vazio se for novo
        };

        const response = await api.post('/chats', chatPayload);
        const chatId = response.data.id;
        
        setBackendChatId(chatId);
        
        // Carrega as mensagens antigas do banco (se houver)
        if (response.data.conversa) {
            try {
                const historico = JSON.parse(response.data.conversa);
                setMessages(Array.isArray(historico) ? historico : []);
            } catch (e) {
                setMessages([]); 
            }
        } else {
             setMessages([]);
        }
        
        // Se estiver vazio, adiciona boas-vindas visual
        if (!response.data.conversa || response.data.conversa === "[]" || response.data.conversa === "Chat iniciado pelo paciente.") {
             setMessages([{
                id: Date.now(),
                type: 'text',
                content: `Olá! Você está falando com ${specialist.nome}.`,
                sender: 'received',
                timestamp: new Date()
            }]);
        }

        setStep('CHAT'); // Muda a tela

    } catch (error) {
        alert("Erro ao iniciar chat.");
        console.error(error);
    }
  };

  // 3. Salvar histórico no Banco sempre que mudar (Só se tiver backendChatId)
  useEffect(() => {
    if (backendChatId && userId && messages.length > 0) {
        const saveToDb = async () => {
            try {
                await api.put(`/chats/${backendChatId}`, {
                    conversa: JSON.stringify(messages),
                    duracao: messages.length,
                    clienteId: parseInt(userId),
                    especialistaId: selectedSpecialist.id
                });
            } catch (error) {
                console.error("Erro ao salvar no banco:", error);
            }
        };
        const timeoutId = setTimeout(saveToDb, 1000); // Debounce de 1s
        return () => clearTimeout(timeoutId);
    }
  }, [messages, backendChatId, userId, selectedSpecialist]);

  // Scroll automático
  useEffect(() => {
    if (messageListRef.current) messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages]);


  // --- FUNÇÕES DE AÇÃO ---

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    setMessages(prev => [...prev, {
      id: Date.now(), type: 'text', content: newMessage, sender: 'sent', timestamp: new Date()
    }]);
    setNewMessage('');
  };

  const handleDeleteMessage = (id) => setMessages(prev => prev.filter(m => m.id !== id));
  
  // Limpar conversa (Limpa no banco também!)
  const handleClearChat = async () => {
    if (window.confirm("Isso apagará o histórico com este especialista. Continuar?")) {
        setMessages([]);
        if (backendChatId) {
            // Atualiza o banco com lista vazia
             await api.put(`/chats/${backendChatId}`, {
                conversa: "[]",
                duracao: 0,
                clienteId: parseInt(userId),
                especialistaId: selectedSpecialist.id
            });
        }
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Limpa tudo
    navigate('/');
  };

  // Trocar de especialista (volta para a seleção)
  const handleChangeSpecialist = () => {
      setStep('SELECTION');
      setBackendChatId(null);
      setSelectedSpecialist(null);
      setMessages([]);
  };

  const handleSuggestWords = async () => {
    setIsGenerating(true);
    try {
        const response = await api.get('/api/pronunciation/words', {
            params: { idade: 10, dificuldade: 'R', quantidade: 3 },
            headers: { 'Authorization': '' }
        });
        if (response.data.palavras) {
            const novas = response.data.palavras.join(', ');
            setPracticeText(novas);
            setMessages(prev => [...prev, {
                id: Date.now(), type: 'text', content: `Sugestão: "${novas}"`, sender: 'received', timestamp: new Date()
            }]);
        }
    } catch (error) { alert("Erro ao gerar."); } finally { setIsGenerating(false); }
  };

  const handleAudioRecording = async () => {
    if (!practiceText.trim()) { alert("Digite as palavras!"); return; }
    if (isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); } 
    else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          setMessages(prev => [...prev, {
            id: Date.now(), type: 'audio', content: audioUrl, sender: 'sent', timestamp: new Date(), targetText: practiceText
          }]);

          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.wav');
          formData.append('palavrasEsperadas', practiceText); 

          try {
            const response = await api.post('/api/pronunciation/analyze-batch-deepgram', formData, {
              headers: { 'Content-Type': 'multipart/form-data', 'Authorization': '' },
            });
            setMessages(prev => [...prev, {
              id: Date.now() + 1, type: 'text', sender: 'received', timestamp: new Date(),
              content: `📊 Resultado para: "${practiceText}"\nNota: ${response.data.pontuacaoGeral?.toFixed(0)}%\n${response.data.feedbackGeral}`
            }]);
          } catch (err) {
            setMessages(prev => [...prev, { id: Date.now()+2, type: 'text', sender: 'received', content: "Erro IA.", timestamp: new Date()}]);
          }
        };
        mediaRecorder.start(); setIsRecording(true);
      } catch (err) { alert("Erro microfone."); }
    }
  };

  return (
    <div className="chat-page-wrapper">
      
      {/* SIDEBAR (Comum às duas telas) */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header"><div className="menu-trigger" onClick={() => setIsSidebarOpen(false)}>☰</div><span className="logo-text">FonoChat</span></div>
        <div className="sidebar-content">
            {/* Botão agora troca de especialista */}
            <div className="new-chat-btn" onClick={handleChangeSpecialist}>+ Trocar Especialista</div>
            
            <div className="menu-section"><p>Navegação</p><ul>
                <li onClick={() => navigate('/perfil')}>👤 Meu Perfil</li>
                <li onClick={() => navigate('/agenda')}>📅 Minha Agenda</li>
                <li onClick={() => navigate('/historico')}>📜 Histórico</li>
                <li onClick={() => navigate('/config')}>⚙️ Configurações</li>
            </ul></div>
            <div className="menu-footer"><button className="logout-btn" onClick={handleLogout}>Sair</button></div>
        </div>
      </div>
  
      <div className="chat-layout">
        
        {/* TELA DE SELEÇÃO */}
        {step === 'SELECTION' && (
            <div className="selection-container">
                <h1>Escolha seu Especialista</h1>
                <p>Selecione um profissional para iniciar o atendimento.</p>
                <div className="specialists-grid">
                    {specialists.length === 0 ? <p>Carregando...</p> : specialists.map(spec => (
                        <div key={spec.id} className="specialist-card" onClick={() => handleSelectSpecialist(spec)}>
                            <div className="spec-avatar">{spec.nome.charAt(0)}</div>
                            <h3>{spec.nome}</h3>
                            <p>{spec.especialidade}</p>
                            <button>Iniciar</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TELA DO CHAT */}
        {step === 'CHAT' && (
            <>
                <header className="chat-top-bar">
                    {!isSidebarOpen && <button className="toggle-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>}
                    <div className="chat-info">
                        <h2>{selectedSpecialist?.nome}</h2>
                    </div>
                    <div className="user-avatar">U</div>
                </header>

                <div className="message-list-container" ref={messageListRef}>
                    <div className="messages-wrapper">
                        {messages.map(m => (
                            <div key={m.id} className={`message-row ${m.sender}`}>
                                <div className="message-bubble">
                                    {m.targetText && <div className="target-label">Treino: {m.targetText}</div>}
                                    {m.type === 'audio' ? <audio controls src={m.content}></audio> : <p style={{whiteSpace:'pre-wrap'}}>{m.content}</p>}
                                    <span className="message-timestamp">{new Date(m.timestamp).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</span>
                                    {m.sender === 'sent' && <span className="delete-icon" onClick={() => handleDeleteMessage(m.id)}>&times;</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
        
                <div className="input-area-wrapper">
                    <div className="practice-input-container">
                        <label>Treino:</label>
                        <input type="text" className="practice-input" value={practiceText} onChange={e => setPracticeText(e.target.value)} placeholder="Palavras..." /><button className="suggest-btn" onClick={handleSuggestWords} disabled={isGenerating}>{isGenerating ? '...' : '✨ Sugerir'}</button>
                    </div>
                    <div className="input-bar">
                        <input type="text" placeholder="Digite..." value={newMessage} onChange={e => setNewMessage(e.target.value)} /><button type="button" className={`mic-btn ${isRecording?'recording':''}`} onClick={handleAudioRecording}>{isRecording?'🟥':'🎤'}</button><button type="submit" className="send-btn" onClick={handleSendMessage}>Enviar</button>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
}

export default ChatPage;