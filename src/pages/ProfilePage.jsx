import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './ProfilePage.css';

function ProfilePage() {
    const navigate = useNavigate();
    
    // Estado adaptável
    const [userData, setUserData] = useState({
        nome: '',
        idade: '',
        endereco: '',
        // Campos exclusivos
        nivel: '',        // Só Cliente
        crmFono: '',      // Só Especialista
        especialidade: '' // Só Especialista
    });

    const [userType, setUserType] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId');
            const type = localStorage.getItem('userType'); // 'CLIENTE' ou 'ESPECIALISTA'
            setUserType(type);
            
            if (!userId) {
                navigate('/login');
                return;
            }

            try {
                // DECIDE QUAL URL CHAMAR
                const endpoint = type === 'ESPECIALISTA' 
                    ? `/especialistas/${userId}` 
                    : `/clientes/${userId}`;

                const response = await api.get(endpoint);
                
                setUserData({
                    nome: response.data.nome || '',
                    idade: response.data.idade || '',
                    endereco: response.data.endereco || '',
                    nivel: response.data.nivel || '',
                    crmFono: response.data.crmFono || '',
                    especialidade: response.data.especialidade || ''
                });

            } catch (err) {
                setError("Erro ao carregar perfil.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);

        const userId = localStorage.getItem('userId');
        const endpoint = userType === 'ESPECIALISTA' ? `/especialistas/${userId}` : `/clientes/${userId}`;

        try {
            await api.put(endpoint, userData);
            setSuccessMessage("Perfil atualizado!");
        } catch (err) {
            setError("Erro ao salvar.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'idade' ? (value ? parseInt(value) : '') : value;
        setUserData(prev => ({ ...prev, [name]: finalValue }));
    };

    if (isLoading) return <div className="profile-page-wrapper"><p>Carregando...</p></div>;

    return (
        <div className="profile-page-wrapper">
            <div className="profile-container">
                <header className="profile-header">
                    <h1>Meu Perfil</h1>
                    <button className="back-button" onClick={() => navigate('/chat')}>Voltar</button>
                </header>

                <div className="profile-content">
                    {error && <p style={{ color: '#ff4757' }}>{error}</p>}
                    {successMessage && <p style={{ color: '#00FF7F' }}>{successMessage}</p>}

                    <div className="profile-avatar-section">
                        <div className="avatar-placeholder">
                            {userData.nome ? userData.nome.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <p className="avatar-role">{userType === 'ESPECIALISTA' ? 'Fonoaudiólogo' : 'Paciente'}</p>
                    </div>

                    <form className="profile-form" onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" name="nome" value={userData.nome} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-group">
                            <label>Idade</label>
                            <input type="number" name="idade" value={userData.idade} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Endereço</label>
                            <input type="text" name="endereco" value={userData.endereco} onChange={handleChange} />
                        </div>

                        {/* CAMPOS DINÂMICOS BASEADOS NO TIPO */}
                        {userType === 'ESPECIALISTA' ? (
                            <>
                                <div className="form-group">
                                    <label>CRFA (Registro)</label>
                                    <input type="text" name="crmFono" value={userData.crmFono} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Especialidade</label>
                                    <input type="text" name="especialidade" value={userData.especialidade} onChange={handleChange} />
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label>Nível</label>
                                <input type="text" name="nivel" value={userData.nivel} readOnly />
                            </div>
                        )}

                        <button type="submit" className="save-button" disabled={isUpdating}>
                            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;