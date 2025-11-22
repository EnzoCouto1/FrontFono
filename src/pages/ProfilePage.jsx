import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './ProfilePage.css';

function ProfilePage() {
    const navigate = useNavigate();
    
    // Estado inicial vazio (para ser preenchido pela API)
    const [userData, setUserData] = useState({
        nome: '',
        idade: '',
        endereco: '',
        nivel: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // --- BUSCAR DADOS DO PERFIL ---
    useEffect(() => {
        const fetchUserData = async () => {
            // 1. Pega o ID salvo no login
            const userId = localStorage.getItem('userId');
            
            if (!userId) {
                setError("Usuário não identificado. Faça login novamente.");
                setIsLoading(false);
                return;
            }

            try {
                // 2. Chama o Back-end
                console.log(`Buscando dados do cliente ID: ${userId}...`);
                const response = await api.get(`/clientes/${userId}`);
                console.log("Dados recebidos:", response.data);
                
                // 3. Atualiza a tela com os dados reais
                setUserData({
                    nome: response.data.nome || '',
                    idade: response.data.idade || '',
                    endereco: response.data.endereco || '',
                    nivel: response.data.nivel || ''
                });

            } catch (err) {
                console.error("Erro ao buscar perfil:", err);
                setError("Erro ao carregar dados. Verifique se o Back-end está rodando.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // --- ATUALIZAR PERFIL ---
    const handleUpdate = async (event) => {
        event.preventDefault();
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);
        const userId = localStorage.getItem('userId');

        try {
            await api.put(`/clientes/${userId}`, userData);
            setSuccessMessage("Perfil atualizado com sucesso!");
        } catch (err) {
            console.error("Erro ao atualizar:", err);
            setError("Falha ao salvar alterações.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    // --- RENDERIZAÇÃO ---
    if (isLoading) return <div className="profile-page-wrapper"><p>Carregando...</p></div>;

    return (
        <div className="profile-page-wrapper">
            <div className="profile-container">
                <header className="profile-header">
                    <h1>Meu Perfil</h1>
                    <button className="back-button" onClick={() => navigate('/chat')}>Voltar</button>
                </header>

                <div className="profile-content">
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

                    <div className="profile-avatar-section">
                        <div className="avatar-placeholder">
                            {userData.nome ? userData.nome.charAt(0).toUpperCase() : '?'}
                        </div>
                        <p className="avatar-role">Nível: {userData.nivel}</p>
                    </div>

                    <form className="profile-form" onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label htmlFor="nome">Nome</label>
                            <input type="text" name="nome" value={userData.nome} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="idade">Idade</label>
                            <input type="number" name="idade" value={userData.idade} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endereco">Endereço</label>
                            <input type="text" name="endereco" value={userData.endereco} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nivel">Nível</label>
                            <input type="text" name="nivel" value={userData.nivel} readOnly style={{backgroundColor: '#e9ecef'}} />
                        </div>

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