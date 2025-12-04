import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './LoginPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  
  // Tipo de Usuário: 'CLIENTE', 'ESPECIALISTA', 'SECRETARIA'
  const [userType, setUserType] = useState('CLIENTE'); 

  const [formData, setFormData] = useState({
    nome: '', idade: '', endereco: '', login: '', senha: '',
    nivel: 'Iniciante', // Cliente
    crmFono: '', especialidade: '', // Especialista
    email: '' // Secretaria (email de contato)
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idade' ? (value ? parseInt(value) : '') : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let endpoint = '/clientes';
      let payload = {
        nome: formData.nome,
        idade: formData.idade,
        endereco: formData.endereco,
        login: formData.login,
        senha: formData.senha
      };

      if (userType === 'ESPECIALISTA') {
        endpoint = '/especialistas';
        payload.crmFono = formData.crmFono;
        payload.especialidade = formData.especialidade;
      } else if (userType === 'SECRETARIA') {
        endpoint = '/secretarias';
        payload.email = formData.email; // Email de contato
      } else {
        payload.nivel = formData.nivel;
      }

      await api.post(endpoint, payload);
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      console.error("Erro:", err);
      setError('Erro ao criar conta. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="welcome-message">
        <h1>Crie sua conta</h1>
        <h2>Escolha seu perfil:</h2>
      </div>

      <div className="login-container-card" style={{ maxWidth: '450px', marginTop: '50px' }}>
        <h1 className="login-title">CADASTRO</h1>
        
        {success ? (
          <div style={{ textAlign: 'center', color: '#00FF7F' }}>
            <h3>Sucesso!</h3>
            <p>Redirecionando...</p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleRegister}>
            {error && <p className="error-message">{error}</p>}

            {/* SELETOR DE TIPO */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {['CLIENTE', 'ESPECIALISTA', 'SECRETARIA'].map(type => (
                    <button 
                        key={type}
                        type="button"
                        onClick={() => setUserType(type)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #00FF7F',
                            borderRadius: '20px',
                            background: userType === type ? '#00FF7F' : 'transparent',
                            color: userType === type ? '#000' : '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    >
                        {type === 'CLIENTE' ? 'Paciente' : type === 'SECRETARIA' ? 'Secretária' : 'Fono'}
                    </button>
                ))}
            </div>
            
            {/* Campos Comuns */}
            <input type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required />
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" name="idade" placeholder="Idade" value={formData.idade} onChange={handleChange} required style={{ width: '30%' }} />
                <input type="text" name="endereco" placeholder="Endereço" value={formData.endereco} onChange={handleChange} required style={{ width: '70%' }} />
            </div>

            {/* Campos Específicos */}
            {userType === 'CLIENTE' && (
               <input type="text" name="nivel" placeholder="Nível (Ex: Iniciante)" value={formData.nivel} onChange={handleChange} required />
            )}

            {userType === 'ESPECIALISTA' && (
               <>
                <input type="text" name="crmFono" placeholder="CRFA" value={formData.crmFono} onChange={handleChange} required />
                <input type="text" name="especialidade" placeholder="Especialidade" value={formData.especialidade} onChange={handleChange} required />
               </>
            )}

            {userType === 'SECRETARIA' && (
               <input type="email" name="email" placeholder="Email de Contato Profissional" value={formData.email} onChange={handleChange} required />
            )}

            {/* Login e Senha (Sempre necessários) */}
            <hr style={{borderColor: '#444', margin: '15px 0'}} />
            <input type="email" name="login" placeholder="Login (Email de Acesso)" value={formData.login} onChange={handleChange} required />
            <input type="password" name="senha" placeholder="Senha" value={formData.senha} onChange={handleChange} required />

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'CRIANDO...' : 'CADASTRAR'}
            </button>

            <div className="recovery-link-container" style={{ marginTop: '15px', textAlign: 'center' }}>
              <span className="recovery-link" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
                Já tem conta? <strong>Voltar para Login</strong>
              </span>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;