import EnlacesAccessPage from '../components/EnlacesAccessPage';

const GestorDeContraseñas = () => (
  <EnlacesAccessPage
    eyebrow="Seguridad"
    title="Gestor de contraseñas"
    description="Accedé a Bitwarden para guardar tus contraseñas y mantener tus credenciales organizadas."
    links={[
      {
        label: 'Abrir Bitwarden',
        description: 'Acceso al administrador de contraseñas.',
        href: 'https://bitwarden.com/',
      },
    ]}
    note="Bitwarden ofrece herramientas para generar y autocompletar contraseñas seguras en tus dispositivos."
  />
);

export default GestorDeContraseñas;