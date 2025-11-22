import api from '../api/axiosConfig';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

// Função para carregar mensagens do Local Storage ou retornar o padrão
const loadInitialMessages = () => {
  const savedMessages = localStorage.getItem('chatMessages');
  if (savedMessages) {
    try {
      return JSON.parse(savedMessages);
    } catch (e) {
      console.error("Erro ao carregar mensagens salvas", e);
    }
  }
  // Mensagem padrão se não houver nada salvo
  return [{ id: 1, type: 'text', content: 'Olá! Como posso te ajudar hoje?', sender: 'received', timestamp: new Date() }];
};

function ChatPage() {
  // ESTADO INICIAL: Carrega do Local Storage
  const [messages, setMessages] = useState(loadInitialMessages);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const messageListRef = useRef(null);
  const audioChunksRef = useRef([]); // Ref para armazenar os chunks de áudio

  // Efeito 1: Salvar a conversa no Local Storage a cada mudança
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error("Erro ao salvar mensagens no Local Storage:", error);
    }
  }, [messages]);

  // Efeito 2: Rolar a lista de mensagens para o final (auto-scroll)
  useEffect(() => {
    if (messageListRef.current) {
      const messageListElement = messageListRef.current;
      messageListElement.scrollTop = messageListElement.scrollHeight;
    }
  }, [messages]);

  // --- HANDLERS ---

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const messageToAdd = {
      id: Date.now(),
      type: 'text',
      content: newMessage,
      sender: 'sent',
      timestamp: new Date()
    };
    setMessages(currentMessages => [...currentMessages, messageToAdd]);
    setNewMessage('');
  };

  const handleDeleteMessage = (idToDelete) => {
    setMessages(currentMessages =>
      currentMessages.filter(message => message.id !== idToDelete)
    );
  };

  const handleAudioRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = []; // Limpa os chunks anteriores

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          // 1. Cria o arquivo de áudio (Blob)
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Adiciona mensagem de áudio "Enviando..." na tela
          const tempId = Date.now();
          setMessages(prev => [...prev, {
            id: tempId,
            type: 'audio',
            content: audioUrl,
            sender: 'sent',
            timestamp: new Date(),
            status: 'analyzing' // Novo status para mostrar loading
          }]);

          // 2. Prepara o envio para a API (FormData)
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.wav');
          // Vamos fixar umas palavras para teste por enquanto
          formData.append('palavrasEsperadas', 'rato, carro, terra'); 

          try {
            // 3. Chama o Back-end (PronunciationController)
            const response = await api.post('/api/pronunciation/analyze-batch-deepgram', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': '' // <--- ISSO ANULA O TOKEN E EVITA O ERRO 500
              },
            });

            console.log("Resposta da IA:", response.data);

            // 4. Cria a mensagem de resposta da IA
            const aiFeedback = {
              id: Date.now() + 1,
              type: 'text',
              sender: 'received',
              timestamp: new Date(),
              // Formata o texto bonitinho com a nota. Verifica se as propriedades existem.
              content: `📊 Análise da IA:\nPontuação Geral: ${response.data.pontuacaoGeral ? response.data.pontuacaoGeral.toFixed(1) : 'N/A'}%\nFeedback: ${response.data.feedbackGeral || 'Sem feedback disponível.'}`
            };

            setMessages(prev => [...prev, aiFeedback]);

          } catch (err) {
            console.error("Erro ao analisar áudio:", err);
            setMessages(prev => [...prev, {
              id: Date.now() + 2,
              type: 'text',
              sender: 'received',
              content: "Erro ao processar o áudio com a IA. Tente novamente.",
              timestamp: new Date()
            }]);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Erro ao acessar microfone:", err);
        alert("Erro ao acessar microfone. Verifique as permissões do navegador.");
      }
    }
  };

  const handleClearChat = () => {
    // Limpa a conversa e o Local Storage
    setMessages([]);
    localStorage.removeItem('chatMessages'); 
  };
  
  const handleLogout = () => navigate('/');

  // --- RENDERIZAÇÃO ---

  return (
    <div className="chat-page-wrapper">
      
      {/* Botão de abrir/fechar sidebar */}
      <button 
        className="sidebar-toggle-button" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>
  
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Opções</h3>
          <button 
            className="sidebar-close-button" 
            onClick={() => setIsSidebarOpen(false)}
          >
            &times;
          </button>
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => navigate('/perfil')}>Meu Perfil</li>
          <li onClick={() => navigate('/config')}>Configurações</li>
          <li onClick={() => navigate('/agenda')}>Minha Agenda</li>
          <li onClick={() => navigate('/historico')}>Histórico de Consultas</li>
        </ul>
      </div>
  
      {/* Container Principal do Chat */}
      <div className="chat-container">
        
        <header className="chat-header">
          <h1>Chat</h1>
          <div className="header-actions">
            <button className="action-button" onClick={handleClearChat}>Limpar Conversa</button>
            <button className="action-button logout" onClick={handleLogout}>Sair</button>
          </div>
        </header>

        <div className="message-list" ref={messageListRef}>
          {/* Renderização Condicional de Mensagens */}
          {messages.length === 0 ? (
            <div className="empty-chat-message">
              <p>Nenhuma mensagem por aqui.</p>
              <p>Envie a primeira mensagem ou um áudio!</p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                
                {/* Conteúdo: Áudio ou Texto */}
                {message.type === 'audio' ? (
                  <audio controls src={message.content}></audio>
                ) : (
                  <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p> 
                )}
                
                {/* Timestamp */}
                <span className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                
                {/* Botão de Deletar */}
                {message.sender === 'sent' && (
                  <button 
                    className="delete-button" 
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))
          )}
        </div>
  
        {/* Formulário de Input e Mídia */}
        <form className="message-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button type="button" className="mic-button" onClick={handleAudioRecording}>
            {isRecording ? '🔴' : '🎤'}
          </button>
          <button type="submit">Enviar</button>
        </form>

      </div>
      
    </div>
  );
}

export default ChatPage;