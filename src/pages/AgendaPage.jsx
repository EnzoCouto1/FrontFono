// Em: src/pages/AgendaPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgendaPage.css'; // <-- Mude para o novo arquivo CSS

function AgendaPage() {
  const navigate = useNavigate();

  // Vamos criar dados falsos para a agenda
  const [appointments, setAppointments] = useState([
    { id: 1, date: '28 de Outubro, 2025', time: '14:00', patient: 'Carlos Silva (Online)' },
    { id: 2, date: '30 de Outubro, 2025', time: '10:30', patient: 'Maria Souza (Presencial)' },
    { id: 3, date: '04 de Novembro, 2025', time: '09:00', patient: 'João Pereira (Online)' },
  ]);

  return (
    // Wrapper para o fundo (igual ao do chat)
    <div className="agenda-page-wrapper">

      {/* Container transparente para o conteúdo (igual ao do chat) */}
      <div className="agenda-container">

        <header className="agenda-header">
          <h1>Minha Agenda</h1>
          <button 
            className="agenda-back-button" 
            onClick={() => navigate('/chat')}
          >
            Voltar ao Chat
          </button>
        </header>

        <div className="appointment-list">
          {appointments.map(appt => (
            <div key={appt.id} className="appointment-card">
              <div className="appt-datetime">
                <span className="appt-date">{appt.date}</span>
                <span className="appt-time">{appt.time}</span>
              </div>
              <div className="appt-patient">
                {appt.patient}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AgendaPage;