import { FiArrowLeft, FiArrowUpRight, FiDownload, FiExternalLink, FiInfo } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../styles/enlaces.css';

const EnlacesAccessPage = ({ eyebrow, title, description, links, note }) => (
  <div className="enlaces-page">
    <main className="enlaces-content enlaces-access-layout">
      <Link className="enlaces-back-link" to="/dashEnlaces">
        <FiArrowLeft aria-hidden="true" />
        Todos los accesos
      </Link>

      <section className="enlaces-page-hero">
        <span className="enlaces-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      <section className="enlaces-access-section" aria-labelledby="enlaces-actions-title">
        <div className="enlaces-section-heading">
          <div>
            <span className="enlaces-eyebrow">Acceso directo</span>
            <h2 id="enlaces-actions-title">Elegí una opción</h2>
          </div>
          <span className="enlaces-action-count">{links.length} {links.length === 1 ? 'enlace' : 'enlaces'}</span>
        </div>

        <div className="enlaces-action-list">
          {links.map((link) => (
            <a
              className="enlaces-action-card"
              href={link.href}
              key={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="enlaces-action-icon">
                {link.download ? <FiDownload aria-hidden="true" /> : <FiExternalLink aria-hidden="true" />}
              </span>
              <span className="enlaces-action-copy">
                <strong>{link.label}</strong>
                {link.description && <span>{link.description}</span>}
              </span>
              <FiArrowUpRight className="enlaces-action-arrow" aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      {note && (
        <aside className="enlaces-note">
          <FiInfo aria-hidden="true" />
          <p>{note}</p>
        </aside>
      )}
    </main>
  </div>
);

EnlacesAccessPage.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    href: PropTypes.string.isRequired,
    download: PropTypes.bool,
  })).isRequired,
  note: PropTypes.string,
};

export default EnlacesAccessPage;
