// Em: src/pages/AgendaPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import './AgendaPage.css';

function AgendaPage() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const getSpecialistName = useCallback(async (especialistaId) => {
        try {
            const response = await api.get(`/especialistas/${especialistaId}`);
            return response.data.nome;
        } catch (e) {
            return 'Especialista';
        }
    }, []);

    useEffect(() => {
        const fetchConsultas = async () => {
            const userId = localStorage.getItem('userId'); // ID do Cliente logado
            
            console.log("Buscando agenda para o usuário:", userId);

            if (!userId) {
                setIsLoading(false);
                return;
            }

            try {
                // 1. Busca todas as consultas desse cliente
                const response = await api.get(`/consultas/cliente/${userId}`);
                console.log("Consultas encontradas:", response.data);

                // 2. Filtra e formata
                const formatted = await Promise.all(
                    response.data.map(async (c) => ({
                        id: c.id,
                        date: c.data, // Formato YYYY-MM-DD
                        time: c.hora, // Formato HH:MM:SS
                        status: c.status,
                        patient: await getSpecialistName(c.especialistaId) // Nome do especialista
                    }))
                );
                
                // Filtra apenas as agendadas (ajuste a string conforme seu banco)
                const agendadas = formatted.filter(c => c.status === 'AGENDADA');
                setAppointments(agendadas);

            } catch (err) {
                console.error("Erro na agenda:", err);
                setError("Erro ao carregar agenda.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchConsultas();
    }, [getSpecialistName]);

    if (isLoading) return <div className="agenda-page-wrapper"><p>Carregando...</p></div>;

    return (
        <div className="agenda-page-wrapper">
            <div className="agenda-container">
                <header className="agenda-header">
                    <h1>Minha Agenda</h1>
                    <button className="agenda-back-button" onClick={() => navigate('/chat')}>
                        Voltar
                    </button>
                </header>

                <div className="appointment-list">
                    {appointments.length === 0 ? (
                         <div className="empty-chat-message">
                            <p>Não há consultas agendadas no sistema.</p>
                         </div>
                    ) : (
                        appointments.map(appt => (
                            <div key={appt.id} className="appointment-card">
                                <div className="appt-datetime">
                                    <span className="appt-date">{appt.date}</span>
                                    <span className="appt-time">{appt.time}</span>
                                </div>
                                <div className="appt-patient">
                                    {appt.patient} <br/>
                                    <small>{appt.status}</small>
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