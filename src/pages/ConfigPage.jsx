// Em: src/pages/ConfigPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConfigPage.css';

// Função para carregar as configurações salvas no Local Storage
const loadInitialState = () => {
  try {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : { darkMode: false, notifications: true };
  } catch (error) {
    console.error("Erro ao carregar configurações do Local Storage:", error);
    return { darkMode: false, notifications: true }; // Retorna padrão em caso de erro
  }
};

function ConfigPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadInitialState);

  // Função para atualizar uma configuração e salvar no Local Storage
  const handleToggle = (key) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      // SALVA A NOVA CONFIGURAÇÃO NO LOCAL STORAGE
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
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
          
          {/* Configuração 1: Modo Escuro */}
          <div className="setting-item">
            <label>Ativar Modo Escuro</label>
            <input 
              type="checkbox"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
          </div>
          
          {/* Configuração 2: Notificações */}
          <div className="setting-item">
            <label>Notificações Ativas</label>
            <input 
              type="checkbox"
              checked={settings.notifications}
              onChange={() => handleToggle('notifications')}
            />
          </div>

          <p className="status-info">
            * Seus dados são salvos automaticamente no navegador.
          </p>

        </div>
      </div>
    </div>
  );
}

export default ConfigPage;