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

// Importe o CSS global
import './index.css';

const router = createBrowserRouter([
  {
    path: "/", // A URL raiz AGORA MOSTRA A TELA DE BEM-VINDO
    element: <WelcomePage />,
  },
  {
    path: "/login", // A TELA DE LOGIN AGORA ESTÁ AQUI
    element: <LoginPage />,
  },
  {
    path: "/chat", // O chat continua o mesmo
    element: <ChatPage />,
  },
  {
    path: "/agenda", // <-- VERIFIQUE SE ESTA ROTA EXISTE
    element: <AgendaPage />,
  },
  {
    path: "/historico", // <-- VERIFIQUE SE ESTA ROTA EXISTE
    element: <HistoricoPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);