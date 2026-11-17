import EnlacesAccessPage from '../../components/EnlacesAccessPage';

const EarsTicketera = () => (
  <EnlacesAccessPage
    eyebrow="Soporte · Ears"
    title="Ticketera Ears"
    description="Accedé a la mesa de ayuda del servicio de outsourcing para crear y consultar tickets."
    links={[
      {
        label: 'Abrir ticketera Ears',
        description: 'Ingresar a la mesa de ayuda.',
        href: 'https://helpdesk.ears.com.ar/otrs/customer.pl#Login',
      },
    ]}
    note="Acceso exclusivo para el personal técnico de la empresa."
  />
);

export default EarsTicketera;
