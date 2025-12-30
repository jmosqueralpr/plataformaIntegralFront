

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header/header';
import Footer from './components/footer';
import { AuthProvider } from './context/authContext'; //El contexto para usuarios.
import RouteChangeListener from './components/routeChangeListener';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


//PAGES
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Configuration from './pages/configuration';
import ComprasDyb from './pages/enlaces/comprasDYB';
import ComprasEmepa from './pages/enlaces/comprasEmepa';
import GestorDeContraseñas from './pages/gestorDeContraseñas';
import TaskManager from './pages/taskManager';
import ExpirationTracker from './pages/expirationTracker';
import SearchSolutions from './pages/searchSolutions';
import SearchSolutionsNew from './pages/searchSolutionsNew';
import Gestionar from './pages/enlaces/gestionar';
import AsistenteTelegram from './pages/asistenteTelegram';
import HerramientasAIS from './pages/herramientasAIS/herramientasAIS';
import VerificadorMGE8 from './pages/herramientasAIS/verificadorMGE8';
import DashEnlaces from './pages/enlaces/dashEnlaces';
import DropboxBackup from './pages/enlaces/dropboxBackup';



const user = { name: 'Nuevo Usuario', loggedIn:"True" };

const App = () => {
  return (


      <AuthProvider> {/* Contexto para nombre de usuario */}

        <Router>
          <Header userName={user.name} />
          <div className='main-container'>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/asistenteTelegram" element={<AsistenteTelegram />} />
              <Route path="/configuration" element={<Configuration />} />
              
              <Route path="/gestorDeContraseñas" element={<GestorDeContraseñas />} />
              
              <Route path="/taskManager" element={<TaskManager />} />
              <Route path="/expirationTracker" element={<ExpirationTracker />} />
              <Route path="/searchSolutions" element={<SearchSolutions />} />
              <Route path="/searchSolutionsNew" element={<SearchSolutionsNew />} />
              {/* Herramientas AIS */}
              <Route path="/herramientasAIS" element={<HerramientasAIS />} />
              <Route path="/verificadorMGE8" element={<VerificadorMGE8 />} />
              {/* Accesos y Enlaces */}
              <Route path="/dashEnlaces" element={<DashEnlaces />} />
              <Route path="/Gestionar" element={<Gestionar />} />
              <Route path="/comprasDYB" element={<ComprasDyb />} />
              <Route path="/comprasEmepa" element={<ComprasEmepa />} />
              <Route path="/DropboxBackup" element={<DropboxBackup />} />
            
            </Routes>
            <RouteChangeListener />
          </div>
          <Footer />
        </Router>
          
        <ToastContainer position="bottom-center" autoClose={8000} /> {/* Esto es para las notificaciones en toda la pagina */}
      </AuthProvider>

  );
};

export default App;
