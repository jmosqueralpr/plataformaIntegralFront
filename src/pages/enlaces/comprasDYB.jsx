import EnlacesAccessPage from '../../components/EnlacesAccessPage';

const ComprasDyb = () => (
  <EnlacesAccessPage
    eyebrow="Compras · DYB"
    title="Sistema de compras DYB"
    description="Gestioná solicitudes de compra y consultá las herramientas de administración del sistema."
    links={[
      {
        label: 'Acceso al sistema de compras',
        description: 'Ingresar como usuario.',
        href: 'http://compras-dyb.com.ar/index.php',
      },
      {
        label: 'Acceso de administrador',
        description: 'Herramientas de administración del sistema.',
        href: 'http://compras-dyb.com.ar/adm/index.php',
      },
    ]}
    note="Plataforma web de uso interno para administrar proveedores, solicitudes, aprobaciones y seguimiento de compras."
  />
);

export default ComprasDyb;
