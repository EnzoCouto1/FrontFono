import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';


function ChatPage() {
  const [messages, setMessages] = useState([
  { id: 1, type: 'text', content: 'Olá! Como posso te ajudar hoje?', sender: 'received', timestamp: new Date() }
]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const messageListRef = useRef(null);

useEffect(() => {
  if (messageListRef.current) {
    // Pega o elemento da lista
    const messageListElement = messageListRef.current;
    // Rola a barra de scroll do elemento para o final
    messageListElement.scrollTop = messageListElement.scrollHeight;
  }
}, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const messageToAdd = {
      id: Date.now(), // <-- CORREÇÃO AQUI
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
        
        const audioChunks = [];
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audioMessage = {
            id: Date.now(), // <-- CORREÇÃO AQUI
            type: 'audio',
            content: audioUrl,
            sender: 'sent',
            timestamp: new Date()
          };
          setMessages(currentMessages => [...currentMessages, audioMessage]);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Erro ao acessar o microfone:", err);
        alert("Não foi possível acessar seu microfone. Verifique as permissões do navegador.");
      }
    }
  };

  const handleClearChat = () => setMessages([]);
  const handleLogout = () => navigate('/');


  return (
    <div className="chat-page-wrapper">
      
      {/* --- BOTÃO DE ABRIR/FECHAR A SIDEBAR --- */}
      <button 
        className="sidebar-toggle-button" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} // <-- O onClick correto
      >
        ☰
      </button>
  
      {/* --- A SIDEBAR (APENAS UMA VEZ) --- */}
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
        {/* Menu com os links de navegação que estávamos fazendo */}
        <ul className="sidebar-menu">
          <li>Meu Perfil</li>
          <li>Configurações</li>
          <li onClick={() => navigate('/agenda')}>
            Minha Agenda
          </li>
          <li onClick={() => navigate('/historico')}>
            Histórico de Consultas
          </li>
        </ul>
      </div>
  
      {/* --- O CONTAINER DO CHAT (APENAS UMA VEZ) --- */}
      <div className="chat-container">
        <header className="chat-header">
          <h1>Chat</h1>
          <div className="header-actions">
            <button className="action-button" onClick={handleClearChat}>Limpar Conversa</button>
            <button className="action-button logout" onClick={handleLogout}>Sair</button>
          </div>
        </header>
  
        <div className="message-list" ref={messageListRef}>
          {messages.length === 0 ? (
            <div className="empty-chat-message">
              <p>Nenhuma mensagem por aqui.</p>
              <p>Envie a primeira mensagem ou um áudio!</p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                {message.type === 'audio' ? (
                  <audio controls src={message.content}></audio>
                ) : (
                  <p>{message.content}</p>
                )}
                <span className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
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
  
        <form className="message-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)} // <-- Corrigi um 'e.g.value'
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