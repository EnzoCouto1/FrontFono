import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './LoginPage.css'; // Mantendo o estilo Dark/Neon

function RegisterPage() {
  const navigate = useNavigate();
  
  // Estado para controlar se é Especialista
  const [isSpecialist, setIsSpecialist] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    endereco: '',
    login: '',
    senha: '',
    // Campos específicos de Cliente
    nivel: 'Iniciante', 
    // Campos específicos de Especialista
    crmFono: '',
    especialidade: ''
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
      // Decide qual endpoint usar e quais dados enviar
      let endpoint = '/clientes';
      let payload = {
        nome: formData.nome,
        idade: formData.idade,
        endereco: formData.endereco,
        login: formData.login,
        senha: formData.senha
      };

      if (isSpecialist) {
        endpoint = '/especialistas';
        // Adiciona campos de médico
        payload.crmFono = formData.crmFono;
        payload.especialidade = formData.especialidade;
      } else {
        // Adiciona campos de paciente
        payload.nivel = formData.nivel;
      }

      // Envia para o Back-end
      await api.post(endpoint, payload);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      setError('Erro ao criar conta. Verifique os dados ou tente outro login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      
      <div className="welcome-message">
        <h1>Crie sua conta</h1>
        <h2>{isSpecialist ? "Junte-se como Profissional" : "Comece sua jornada agora"}</h2>
      </div>

      <div className="login-container-card" style={{ maxWidth: '450px', marginTop: '50px' }}>
        <h1 className="login-title">CADASTRO</h1>
        
        {success ? (
          <div style={{ textAlign: 'center', color: '#00FF7F' }}>
            <h3>Sucesso!</h3>
            <p>Redirecionando para o login...</p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleRegister}>
            
            {error && <p className="error-message">{error}</p>}

            {/* --- CHECKBOX DE TIPO DE USUÁRIO --- */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
              <input 
                type="checkbox" 
                checked={isSpecialist} 
                onChange={(e) => setIsSpecialist(e.target.checked)}
                style={{ width: '20px', margin: 0, cursor: 'pointer', accentColor: '#00FF7F' }}
              />
              <label onClick={() => setIsSpecialist(!isSpecialist)} style={{ cursor: 'pointer', fontSize: '14px' }}>
                Sou Fonoaudiólogo(a)
              </label>
            </div>
            
            {/* Campos Comuns */}
            <input type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required />
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" name="idade" placeholder="Idade" value={formData.idade} onChange={handleChange} required style={{ width: '30%' }} />
                <input type="text" name="endereco" placeholder="Endereço" value={formData.endereco} onChange={handleChange} required style={{ width: '70%' }} />
            </div>

            {/* --- CAMPOS CONDICIONAIS --- */}
            {isSpecialist ? (
              // Se for ESPECIALISTA mostra estes:
              <>
                <input type="text" name="crmFono" placeholder="CRFA (Registro)" value={formData.crmFono} onChange={handleChange} required />
                <input type="text" name="especialidade" placeholder="Especialidade (Ex: Voz, Audiologia)" value={formData.especialidade} onChange={handleChange} required />
              </>
            ) : (
              // Se for CLIENTE mostra este:
              <input type="text" name="nivel" placeholder="Nível (Ex: Iniciante)" value={formData.nivel} onChange={handleChange} required />
            )}

            <input type="email" name="login" placeholder="Email (Login)" value={formData.login} onChange={handleChange} required />
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