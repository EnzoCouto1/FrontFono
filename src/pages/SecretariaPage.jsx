import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './SecretariaPage.css';

function SecretariaPage() {
    const navigate = useNavigate();
    
    // Dados
    const [clientes, setClientes] = useState([]);
    const [especialistas, setEspecialistas] = useState([]);
    const [todasConsultas, setTodasConsultas] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(false);

    // Formulário
    const [formData, setFormData] = useState({
        clienteId: '',
        especialistaId: '',
        data: '',
        time: '',
        tipo: 'Consulta de Rotina'
    });

    // 1. Carregar Dados Iniciais (Listas e Consultas)
    useEffect(() => {
        const loadData = async () => {
            try {
                const [resCli, resEsp] = await Promise.all([
                    api.get('/clientes'),
                    api.get('/especialistas')
                ]);
                setClientes(resCli.data);
                setEspecialistas(resEsp.data);
                
                // Pré-seleciona os primeiros
                if (resCli.data.length > 0) setFormData(p => ({...p, clienteId: resCli.data[0].id}));
                if (resEsp.data.length > 0) setFormData(p => ({...p, especialistaId: resEsp.data[0].id}));

                // Carrega a lista de consultas imediatamente
                fetchConsultas();

            } catch (e) { console.error("Erro ao carregar dados", e); }
        };
        loadData();
    }, []);

    // 2. Buscar Consultas e Nomes
    const fetchConsultas = async () => {
        setIsLoadingList(true);
        try {
            const response = await api.get('/consultas');
            
            const consultasComNomes = await Promise.all(
                response.data.map(async (c) => {
                    let pacienteNome = '...';
                    let medicoNome = '...';
                    try {
                        const resC = await api.get(`/clientes/${c.clienteId}`);
                        pacienteNome = resC.data.nome;
                    } catch (e) { pacienteNome = 'Desconhecido'; }

                    try {
                        const resE = await api.get(`/especialistas/${c.especialistaId}`);
                        medicoNome = resE.data.nome;
                    } catch (e) { medicoNome = 'Desconhecido'; }

                    return { ...c, pacienteNome, medicoNome };
                })
            );

            // Ordena: Futuras primeiro, depois passadas
            consultasComNomes.sort((a, b) => new Date(b.data) - new Date(a.data));
            setTodasConsultas(consultasComNomes);

        } catch (error) {
            console.error("Erro ao buscar lista:", error);
        } finally {
            setIsLoadingList(false);
        }
    };

    // 3. Agendar Nova Consulta
    const handleAgendar = async (e) => {
        e.preventDefault();
        try {
            await api.post('/consultas', {
                data: formData.data,
                hora: formData.time + ":00",
                tipo: formData.tipo,
                status: "AGENDADA",
                clienteId: formData.clienteId,
                especialistaId: formData.especialistaId
            });
            
            alert("Agendamento realizado com sucesso!");
            fetchConsultas(); // Atualiza a lista ao lado na hora!
            
        } catch (err) {
            alert("Erro ao agendar. Verifique os dados.");
        }
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="secretaria-wrapper">
            <div className="secretaria-container">
                <header className="secretaria-header">
                    <h1>Painel da Secretária</h1>
                    <button className="logout-btn-header" onClick={handleLogout}>Sair</button>
                </header>

                <div className="secretaria-content">
                    
                    {/* ESQUERDA: FORMULÁRIO DE AGENDAMENTO */}
                    <div className="schedule-section">
                        <h2>📅 Novo Agendamento</h2>
                        <form onSubmit={handleAgendar} className="secretaria-form">
                            <div className="form-group">
                                <label>Paciente:</label>
                                <select name="clienteId" value={formData.clienteId} onChange={handleChange}>
                                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Especialista:</label>
                                <select name="especialistaId" value={formData.especialistaId} onChange={handleChange}>
                                    {especialistas.map(e => <option key={e.id} value={e.id}>{e.nome} - {e.especialidade}</option>)}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Data:</label>
                                    <input type="date" name="data" value={formData.data} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Hora:</label>
                                    <input type="time" name="time" value={formData.time} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tipo:</label>
                                <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} />
                            </div>

                            <button type="submit" className="btn-agendar">AGENDAR</button>
                        </form>
                    </div>

                    {/* DIREITA: LISTA DE TODAS AS CONSULTAS */}
                    <div className="list-section">
                        <h2>📋 Agenda Completa</h2>
                        <div className="consultas-list-wrapper">
                            {isLoadingList ? <p className="loading-text">Atualizando lista...</p> : 
                             todasConsultas.length === 0 ? <div className="empty-list"><p>Nenhuma consulta marcada.</p></div> : (
                                todasConsultas.map(consulta => (
                                    <div key={consulta.id} className={`consulta-item ${consulta.status}`}>
                                        <div className="date-box">
                                            <span className="day">{new Date(consulta.data).getDate()}</span>
                                            <span className="month">{new Date(consulta.data).toLocaleDateString('pt-BR', {month:'short'}).replace('.','')}</span>
                                        </div>
                                        <div className="info-box">
                                            <strong className="paciente-nome">{consulta.pacienteNome}</strong>
                                            <div className="medico-row">Dr(a). {consulta.medicoNome}</div>
                                            <div className="hora-row">{consulta.hora?.substring(0,5)} • {consulta.tipo}</div>
                                        </div>
                                        <div className="status-box">
                                            <span className={`badge ${consulta.status}`}>{consulta.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default SecretariaPage;