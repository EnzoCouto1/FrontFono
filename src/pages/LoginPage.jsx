// Em: src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        login: email,
        senha: password
      });

      // Agora recebemos também o 'tipoUsuario'
      const { token, id, tipoUsuario } = response.data;

      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', id);
        localStorage.setItem('userType', tipoUsuario); // <--- SALVANDO O TIPO!
        navigate('/chat');
      }
    } catch (err) {
      setError('Email ou senha inválidos.');
      console.error("Erro no login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper"> 
      
      <div className="welcome-message">
        <h1>Faça login</h1>
        <h2>E entre para o nosso time</h2>
      </div>

      <div className="custom-text-box">
        <h1>Sua Voz, Sua Identidade</h1>
        <p>A comunicação é a chave que abre todas as portas do mundo.</p>
        <p>Aqui, unimos tecnologia e cuidado para garantir que você ouça cada detalhe e se expresse com confiança.</p>
      </div>

      <div className="login-container-card">
        <h1 className="login-title">LOGIN</h1>
        
        <form className="login-form" onSubmit={handleLogin}>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="input-group">
            <label htmlFor="email">Usuário</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Usuário" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Senha" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          {/* --- AQUI ESTÁ A CORREÇÃO --- */}
          <div className="recovery-link-container">
            <span 
              className="recovery-link" 
              onClick={() => navigate('/register')} // Agora vai para o cadastro
              style={{ cursor: 'pointer' }}
            >
              Não tem conta? <strong>Cadastre-se</strong>
            </span>
          </div>
          {/* ---------------------------- */}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'ENTRANDO...' : 'LOGIN'}
          </button>

        </form>
      </div>
      
    </div>
  );
}

export default LoginPage;