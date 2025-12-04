// Dentro de src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// Importe suas novas páginas
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import AgendaPage from './pages/AgendaPage';     
import HistoricoPage from './pages/HistoricoPage';
import ProfilePage from './pages/ProfilePage';
import ConfigPage from './pages/ConfigPage';
import RegisterPage from './pages/RegisterPage';
import SpecialistPage from './pages/SpecialistPage';
import SecretariaPage from './pages/SecretariaPage';

// Importe o CSS global
import './index.css';

const router = createBrowserRouter([
  {
    path: "/", 
    element: <WelcomePage />,
  },
  {
    path: "/login", // 
    element: <LoginPage />,
  },
  {
    path: "/register", 
    element: <RegisterPage />,
  },
  {
    path: "/chat", //
    element: <ChatPage />,
  },
  {
    path: "/agenda", // 
    element: <AgendaPage />,
  },
  {
    path: "/historico", // 
    element: <HistoricoPage />,
  },
  {
    path: "/perfil", // 
    element: <ProfilePage />,
  },
  {
    path: "/config", // 
    element: <ConfigPage />,
  },
  {
    path: "/painel-especialista",
    element: <SpecialistPage />,
  },
  {
    path: "/painel-secretaria",
    element: <SecretariaPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);