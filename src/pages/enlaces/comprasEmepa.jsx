import EnlacesAccessPage from '../../components/EnlacesAccessPage';

const ComprasEmepa = () => (
  <EnlacesAccessPage
    eyebrow="Compras · Emepa"
    title="Sistema de compras Emepa"
    description="Accedé al sistema de compras de Emepa o a su área administrativa."
    links={[
      {
        label: 'Acceso al sistema de compras',
        description: 'Ingresar como usuario.',
        href: 'http://gbacompras-emepa.com.ar/emepa/index.php',
      },
      {
        label: 'Acceso de administrador',
        description: 'Herramientas de administración del sistema.',
        href: 'https://gbacompras-emepa.com.ar/emepa/adm/index.php',
      },
    ]}
    note="Plataforma interna para administrar proveedores, solicitudes de compra, aprobaciones y seguimiento de facturas."
  />
);

export default ComprasEmepa;
