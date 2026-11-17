

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/header/header';
import Footer from './components/footer';
import Sidebar from './components/sidebar';
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
import EarsTicketera from './pages/enlaces/earsTicketera';
import TelegramMessages from './pages/telegramMessages';
import AsistenteTelegram from './pages/asistenteTelegram';
import HerramientasAIS from './pages/herramientasAIS/herramientasAIS';
import VerificadorMGE8 from './pages/herramientasAIS/verificadorMGE8';
import DashEnlaces from './pages/enlaces/dashEnlaces';
import DropboxBackup from './pages/enlaces/dropboxBackup';
import DashboardBaseAIS from './pages/dashboardBaseAIS';
import BaseAIS from './pages/baseAIS';
import UserManagement from './pages/userManagement';



const user = { name: 'Nuevo Usuario', loggedIn: 'True' };

const AppLayout = () => {
  const location = useLocation();
  const isLoginRoute = location.pathname === '/';
  const showSidebar = !isLoginRoute;

  return (
    <>
      <Header userName={user.name} />
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? 'main-container with-sidebar' : 'main-container login-main-container'}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/asistenteTelegram" element={<AsistenteTelegram />} />
          <Route path="/telegramMessages" element={<TelegramMessages />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/userManagement" element={<UserManagement />} />

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
          <Route path="/earsTicketera" element={<EarsTicketera />} />
          <Route path="/comprasDYB" element={<ComprasDyb />} />
          <Route path="/comprasEmepa" element={<ComprasEmepa />} />
          <Route path="/DropboxBackup" element={<DropboxBackup />} />

          <Route path="/DashboardBaseAIS" element={<DashboardBaseAIS />} />
          <Route path="/BaseAIS/:baseId" element={<BaseAIS />} />
        </Routes>
        <RouteChangeListener />
      </div>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
      <ToastContainer position="bottom-center" autoClose={8000} />
    </AuthProvider>
  );
};

export default App;
