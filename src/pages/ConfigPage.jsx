// Em: src/pages/ConfigPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConfigPage.css';

// Função para carregar (padrão: escuro ativado)
const loadInitialState = () => {
  const saved = localStorage.getItem('appSettings');
  // Padrão: darkMode true (pois seu app já é escuro)
  return saved ? JSON.parse(saved) : { darkMode: true, notifications: false };
};

function ConfigPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadInitialState);

  // --- EFEITO 1: APLICAR O TEMA ---
  useEffect(() => {
    // Salva no LocalStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));

    // Aplica a classe no corpo do site
    if (settings.darkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [settings.darkMode]);

  // --- EFEITO 2: GERENCIAR NOTIFICAÇÕES ---
  const handleNotificationToggle = () => {
    const newState = !settings.notifications;
    
    if (newState === true) {
      // Se ligou, pede permissão
      if (!("Notification" in window)) {
        alert("Este navegador não suporta notificações.");
        return;
      }
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setSettings(prev => ({ ...prev, notifications: true }));
          new Notification("Notificações Ativadas!", { body: "Agora você receberá alertas do FonoChat." });
        } else {
          alert("Permissão negada. Habilite no navegador.");
          setSettings(prev => ({ ...prev, notifications: false }));
        }
      });
    } else {
      // Se desligou, apenas atualiza o estado
      setSettings(prev => ({ ...prev, notifications: false }));
    }
  };

  // Função genérica para outros toggles
  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="config-page-wrapper">
      <div className="config-container">
        
        <header className="config-header">
          <h1>Configurações</h1>
          <button className="back-button" onClick={() => navigate('/chat')}>
            Voltar
          </button>
        </header>

        <div className="settings-list">
          
          {/* Configuração 1: Modo Escuro (Switch) */}
          <div className="setting-item">
            <label>Modo Escuro (Padrão)</label>
            <div className="switch-container">
                <input 
                  type="checkbox" 
                  id="darkModeSwitch"
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
                <label htmlFor="darkModeSwitch" className="switch-label">Toggle</label>
            </div>
          </div>
          
          {/* Configuração 2: Notificações (Switch) */}
          <div className="setting-item">
            <label>Notificações</label>
            <div className="switch-container">
                <input 
                  type="checkbox" 
                  id="notifSwitch"
                  checked={settings.notifications}
                  // onChange usa a função especial que pede permissão
                  onChange={handleNotificationToggle} 
                />
                <label htmlFor="notifSwitch" className="switch-label">Toggle</label>
            </div>
          </div>

          <p className="status-info">
            * As alterações são salvas automaticamente.
          </p>

        </div>
      </div>
    </div>
  );
}

export default ConfigPage;