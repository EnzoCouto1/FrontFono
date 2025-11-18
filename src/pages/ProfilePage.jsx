// Em: src/pages/ProfilePage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();

  // Simulação dos dados do usuário
  const [userData, setUserData] = useState({
    name: 'Enzo Couto',
    email: 'enzo.dev@exemplo.com',
    phone: '(35) 99999-8888',
    role: 'Fonoaudiólogo(a)'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        
        <header className="profile-header">
          <h1>Meu Perfil</h1>
          <button className="back-button" onClick={() => navigate('/chat')}>
            Voltar
          </button>
        </header>

        <div className="profile-content">
          {/* Área do Avatar (Foto) */}
          <div className="profile-avatar-section">
            <div className="avatar-placeholder">
              {userData.name.charAt(0)} {/* Mostra a primeira letra do nome */}
            </div>
            <p className="avatar-role">{userData.role}</p>
          </div>

          {/* Formulário de Dados */}
          <form className="profile-form">
            <div className="form-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                name="name"
                value={userData.name} 
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={userData.email} 
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input 
                type="tel" 
                name="phone"
                value={userData.phone} 
                onChange={handleChange}
              />
            </div>

            <button type="button" className="save-button" onClick={() => alert('Dados salvos!')}>
              Salvar Alterações
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;