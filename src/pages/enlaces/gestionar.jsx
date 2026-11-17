import EnlacesAccessPage from '../../components/EnlacesAccessPage';

const Gestionar = () => (
  <EnlacesAccessPage
    eyebrow="Descargas"
    title="Gestionar"
    description="Descargá la versión vigente del sistema desde el enlace oficial."
    links={[
      {
        label: 'Descargar Gestionar',
        description: 'Instalador disponible en Dropbox.',
        href: 'https://www.dropbox.com/scl/fi/16ez7mq9v4sksl66qzvpv/dyb-gestionar-nuevo.exe?rlkey=yx3zcpofwio2wrsuu0j96t5xl&st=82hcr22z&e=1&dl=0',
        download: true,
      },
    ]}
    note="Descargá el instalador en tu PC, copialo al escritorio y ejecutalo. Es posible que necesites actualizar Java."
  />
);

export default Gestionar;
