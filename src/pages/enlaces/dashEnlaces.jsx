import { useEffect } from 'react';
import { FiArrowUpRight, FiCloud, FiDownload, FiHeadphones, FiLock, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../../styles/enlaces.css';

const accessLinks = [
  {
    title: 'Backups en Dropbox',
    category: 'Archivos',
    description: 'Cargá fotos, derrotas y logs, o consultá las carpetas de cada embarcación.',
    to: '/DropboxBackup',
    icon: FiCloud,
  },
  {
    title: 'Gestionar',
    category: 'Descargas',
    description: 'Accedé a las opciones de descarga e instalación del sistema.',
    to: '/Gestionar',
    icon: FiDownload,
  },
  {
    title: 'Compras DYB',
    category: 'Compras',
    description: 'Ingresá al sistema de compras de DYB y a sus herramientas administrativas.',
    to: '/comprasDYB',
    icon: FiShoppingCart,
  },
  {
    title: 'Compras Emepa',
    category: 'Compras',
    description: 'Ingresá al sistema de compras de Emepa y a sus herramientas administrativas.',
    to: '/comprasEmepa',
    icon: FiShoppingCart,
  },
  {
    title: 'Gestor de contraseñas',
    category: 'Seguridad',
    description: 'Abrí Bitwarden para guardar y administrar tus accesos.',
    to: '/GestorDeContraseñas',
    icon: FiLock,
  },
  {
    title: 'Ticketera Ears',
    category: 'Soporte técnico',
    description: 'Mesa de ayuda del servicio de outsourcing para el personal técnico.',
    to: '/earsTicketera',
    icon: FiHeadphones,
  },
];

const DashEnlaces = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="enlaces-page enlaces-portal">
      <main className="enlaces-content enlaces-main">
        <section className="enlaces-portal-hero">
          <div className="enlaces-portal-hero-copy">
            <span className="enlaces-eyebrow">Centro de recursos</span>
            <h1>Accesos y enlaces</h1>
            <p>Encontrá en un solo lugar las herramientas, descargas y carpetas que usás en tu trabajo diario.</p>
          </div>
          <div className="enlaces-portal-meta" aria-label={`${accessLinks.length} accesos disponibles`}>
            <strong>{accessLinks.length}</strong>
            <span>accesos disponibles</span>
          </div>
        </section>

        <section className="enlaces-card-grid" aria-label="Herramientas y accesos">
          {accessLinks.map(({ title, category, description, to, icon: Icon }) => (
            <Link className="enlaces-portal-card" to={to} key={to}>
              <span className="enlaces-portal-card-top">
                <span className="enlaces-portal-icon"><Icon aria-hidden="true" /></span>
                <span className="enlaces-portal-category">{category}</span>
              </span>
              <h2>{title}</h2>
              <p>{description}</p>
              <span className="enlaces-portal-card-cta">
                Abrir recurso <FiArrowUpRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
};

export default DashEnlaces;
