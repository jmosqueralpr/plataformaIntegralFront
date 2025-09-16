

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header/header';
import Footer from './components/footer';
import { AuthProvider } from './context/authContext'; //El contexto para usuarios.
import RouteChangeListener from './components/routeChangeListener';

//PAGES
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Configuration from './pages/configuration';
import ComprasDyb from './pages/comprasDYB';
import ComprasEmepa from './pages/comprasEmepa';
import GestorDeContraseñas from './pages/gestorDeContraseñas';
import TaskManager from './pages/taskManager';
import ExpirationTracker from './pages/expirationTracker';
import SearchSolutions from './pages/searchSolutions';
import SearchSolutionsNew from './pages/searchSolutionsNew';
import Gestionar from './pages/gestionar';
import AsistenteTelegram from './pages/asistenteTelegram';



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
              <Route path="/comprasDYB" element={<ComprasDyb />} />
              <Route path="/comprasEmepa" element={<ComprasEmepa />} />
              <Route path="/gestorDeContraseñas" element={<GestorDeContraseñas />} />
              <Route path="/Gestionar" element={<Gestionar />} />
              <Route path="/taskManager" element={<TaskManager />} />
              <Route path="/expirationTracker" element={<ExpirationTracker />} />
              <Route path="/searchSolutions" element={<SearchSolutions />} />
              <Route path="/searchSolutionsNew" element={<SearchSolutionsNew />} />
            
            </Routes>
            <RouteChangeListener />
          </div>
          <Footer />
        </Router>
          
        
      </AuthProvider>

  );
};

export default App;
