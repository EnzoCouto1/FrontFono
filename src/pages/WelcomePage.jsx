import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css'; // Vamos criar este arquivo

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <h1>Bem-vindo!</h1>
        <p>Este é o seu assistente pessoal de fonoaudiologia.</p>
        <button 
          className="welcome-button" 
          onClick={() => navigate('/login')}
        >
          Fazer Login
        </button>
        {/* No futuro, podemos adicionar um botão de registro aqui */}
      </div>
    </div>
  );
}

export default WelcomePage;