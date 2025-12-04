import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import './AgendaPage.css';

function AgendaPage() {
    const navigate = useNavigate();
    
    // Estados
    const [appointments, setAppointments] = useState([]);
    const [specialists, setSpecialists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados do Formulário
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        type: 'Terapia de Fala',
        specialistId: ''
    });

    // --- VERIFICAÇÃO DE PERMISSÃO ---
    const userType = localStorage.getItem('userType'); // 'CLIENTE', 'ESPECIALISTA' ou 'SECRETARIA'
    const canSchedule = userType === 'SECRETARIA'; // Só secretária pode agendar aqui

    // 1. Buscar Especialistas (Só busca se tiver permissão, para economizar recurso)
    useEffect(() => {
        if (canSchedule) {
            const fetchSpecialists = async () => {
                try {
                    const response = await api.get('/especialistas');
                    setSpecialists(response.data);
                    if (response.data.length > 0) {
                        setFormData(prev => ({ ...prev, specialistId: response.data[0].id }));
                    }
                } catch (err) {
                    console.error("Erro ao buscar especialistas:", err);
                }
            };
            fetchSpecialists();
        }
    }, [canSchedule]);

    // 2. Buscar Consultas
    const fetchConsultas = useCallback(async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            setIsLoading(true);
            // Se for cliente, busca as dele. Se for secretária/médico, a lógica pode mudar no futuro.
            // Por enquanto, assumimos que nesta página vemos a agenda do usuário logado.
            const response = await api.get(`/consultas/cliente/${userId}`);
            
            const consultasComNomes = await Promise.all(
                response.data
                    .filter(c => c.status === 'AGENDADA') 
                    .map(async (c) => {
                        let nomeEspecialista = 'Especialista';
                        try {
                            const resp = await api.get(`/especialistas/${c.especialistaId}`);
                            nomeEspecialista = resp.data.nome;
                        } catch (e) {}

                        return {
                            id: c.id,
                            date: c.data,
                            time: c.hora,
                            type: c.tipo,
                            patient: nomeEspecialista
                        };
                    })
            );
            
            consultasComNomes.sort((a, b) => new Date(a.date) - new Date(b.date));
            setAppointments(consultasComNomes);
        } catch (err) {
            console.error("Erro ao buscar agenda:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConsultas();
    }, [fetchConsultas]);

    // 3. Agendar (Só funciona se for Secretária)
    const handleSchedule = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId'); // Aqui seria o ID do cliente logado

        try {
            const payload = {
                data: formData.date,
                hora: formData.time + ":00",
                tipo: formData.type,
                status: "AGENDADA",
                clienteId: parseInt(userId), // Agenda para o usuário atual
                especialistaId: parseInt(formData.specialistId)
            };

            await api.post('/consultas', payload);
            alert("Consulta agendada com sucesso!");
            setShowForm(false);
            fetchConsultas();
            
        } catch (err) {
            alert("Erro ao agendar.");
        }
    };

    const handleInputChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <div className="agenda-page-wrapper">
            <div className="agenda-container">
                <header className="agenda-header">
                    <h1>Minha Agenda</h1>
                    <div className="header-buttons">
                        
                        {/* --- BOTÃO VISÍVEL APENAS PARA SECRETÁRIA --- */}
                        {canSchedule && (
                            <button 
                                className="new-appt-button" 
                                onClick={() => setShowForm(!showForm)}
                            >
                                {showForm ? 'Cancelar' : '+ Nova Consulta'}
                            </button>
                        )}

                        <button className="agenda-back-button" onClick={() => navigate('/chat')}>
                            Voltar
                        </button>
                    </div>
                </header>

                {/* --- FORMULÁRIO SÓ APARECE SE FOR SECRETÁRIA E TIVER CLICADO --- */}
                {canSchedule && showForm && (
                    <form className="schedule-form" onSubmit={handleSchedule}>
                        <h3>Agendar Horário</h3>
                        {/* ... campos do formulário ... */}
                        <div className="form-group">
                            <label>Especialista</label>
                            <select name="specialistId" value={formData.specialistId} onChange={handleInputChange}>
                                {specialists.map(esp => (
                                    <option key={esp.id} value={esp.id}>{esp.nome} - {esp.especialidade}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Data</label>
                                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Hora</label>
                                <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Tipo</label>
                            <input type="text" name="type" value={formData.type} onChange={handleInputChange} placeholder="Ex: Terapia" required />
                        </div>

                        <button type="submit" className="confirm-schedule-btn">Confirmar Agendamento</button>
                    </form>
                )}

                <div className="appointment-list">
                    {isLoading ? (
                        <p style={{textAlign: 'center', color: '#888'}}>Carregando...</p>
                    ) : appointments.length === 0 ? (
                         <div className="empty-chat-message">
                            <p>Nenhuma consulta futura agendada.</p>
                            {/* Mensagem explicativa para o Cliente */}
                            {!canSchedule && <p style={{fontSize: '12px', marginTop: '10px'}}>Entre em contato com a secretaria para agendar.</p>}
                         </div>
                    ) : (
                        appointments.map(appt => (
                            <div key={appt.id} className="appointment-card">
                                <div className="appt-datetime">
                                    <span className="appt-date">{new Date(appt.date).toLocaleDateString('pt-BR')}</span>
                                    <span className="appt-time">{appt.time.substring(0,5)}</span>
                                </div>
                                <div className="appt-patient">
                                    <strong>{appt.patient}</strong>
                                    <small>{appt.type}</small>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default AgendaPage;