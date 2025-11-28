import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import './AgendaPage.css';

function AgendaPage() {
    const navigate = useNavigate();
    
    // Estados da Lista
    const [appointments, setAppointments] = useState([]);
    const [specialists, setSpecialists] = useState([]); // Lista de especialistas para o select
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados do Formulário
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        type: 'Terapia de Fala', // Valor padrão
        specialistId: ''
    });

    // 1. Buscar Especialistas (Para preencher o <select>)
    useEffect(() => {
        const fetchSpecialists = async () => {
            try {
                const response = await api.get('/especialistas');
                setSpecialists(response.data);
                // Se tiver especialistas, seleciona o primeiro por padrão
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, specialistId: response.data[0].id }));
                }
            } catch (err) {
                console.error("Erro ao buscar especialistas:", err);
            }
        };
        fetchSpecialists();
    }, []);

    // 2. Buscar Consultas (Lista Principal)
    const fetchConsultas = useCallback(async () => {
        const clienteId = localStorage.getItem('userId');
        if (!clienteId) return;

        try {
            setIsLoading(true);
            const response = await api.get(`/consultas/cliente/${clienteId}`);
            
            // Precisamos buscar o nome do especialista para cada consulta
            // (Isso poderia ser otimizado no back-end, mas faremos aqui)
            const consultasComNomes = await Promise.all(
                response.data
                    .filter(c => c.status === 'AGENDADA') // Só mostra as futuras
                    .map(async (c) => {
                        let nomeEspecialista = 'Especialista';
                        try {
                            const respEsp = await api.get(`/especialistas/${c.especialistaId}`);
                            nomeEspecialista = respEsp.data.nome;
                        } catch (e) { /* ignora erro */ }

                        return {
                            id: c.id,
                            date: c.data,
                            time: c.hora,
                            type: c.tipo,
                            patient: nomeEspecialista
                        };
                    })
            );
            
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

    // 3. Lidar com o Envio do Formulário (Agendar)
    const handleSchedule = async (e) => {
        e.preventDefault();
        const clienteId = localStorage.getItem('userId');

        if (!formData.date || !formData.time || !formData.specialistId) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            // Monta o JSON igual ao que fazíamos no Swagger
            const payload = {
                data: formData.date,
                hora: formData.time + ":00", // Adiciona segundos se necessário
                tipo: formData.type,
                status: "AGENDADA",
                clienteId: parseInt(clienteId),
                especialistaId: parseInt(formData.specialistId)
            };

            await api.post('/consultas', payload);
            
            alert("Consulta agendada com sucesso!");
            setShowForm(false); // Fecha o formulário
            fetchConsultas();   // Recarrega a lista
            
        } catch (err) {
            console.error("Erro ao agendar:", err);
            alert("Erro ao agendar. Verifique os dados.");
        }
    };

    // Lidar com mudanças nos inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="agenda-page-wrapper">
            <div className="agenda-container">
                <header className="agenda-header">
                    <h1>Minha Agenda</h1>
                    <div className="header-buttons">
                        <button 
                            className="new-appt-button" 
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Cancelar' : '+ Nova Consulta'}
                        </button>
                        <button className="agenda-back-button" onClick={() => navigate('/chat')}>
                            Voltar
                        </button>
                    </div>
                </header>

                {/* --- FORMULÁRIO DE AGENDAMENTO (Aparece só quando clica) --- */}
                {showForm && (
                    <form className="schedule-form" onSubmit={handleSchedule}>
                        <h3>Agendar Horário</h3>
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
                            <label>Especialista</label>
                            <select name="specialistId" value={formData.specialistId} onChange={handleInputChange}>
                                {specialists.map(esp => (
                                    <option key={esp.id} value={esp.id}>{esp.nome} - {esp.especialidade}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tipo de Consulta</label>
                            <input type="text" name="type" value={formData.type} onChange={handleInputChange} placeholder="Ex: Terapia de Voz" />
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