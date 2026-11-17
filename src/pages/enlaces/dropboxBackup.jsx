import { FiArrowLeft, FiArrowUpRight, FiFolder, FiUploadCloud } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import enlacesBackupImg from '../../img/Enlaces/enlacesBackup.png';
import '../../styles/enlaces.css';

const vesselResources = [
  {
    name: 'YAKTEMI',
    uploads: [
      { label: 'Fotos', href: 'https://www.dropbox.com/request/ycMDrdE8Ywoj7CU8F8rr' },
      { label: 'Derrotas', href: 'https://www.dropbox.com/request/F7Vb7MrNqMsGFxOxegFp' },
      { label: 'Logs AIS', href: 'https://www.dropbox.com/request/ENKAvzyGhuoLDFt4YXvt' },
    ],
    folder: 'https://www.dropbox.com/scl/fo/plustrq412fnqrcts3sm4/APDfP6cSK_JapOI3VJDDijM?rlkey=m9e28kpz6peurbmmu5ogd7tg6&st=stdw69qj&dl=0',
  },
  {
    name: 'OCEANO',
    uploads: [
      { label: 'Fotos', href: 'https://www.dropbox.com/request/kbs7qtsms19j9ifktawh' },
      { label: 'Derrotas', href: 'https://www.dropbox.com/request/lv30hdn3gk15kmlpb7b6' },
      { label: 'Logs AIS', href: 'https://www.dropbox.com/request/pobtutv0l4bwabgqouya' },
    ],
    folder: 'https://www.dropbox.com/scl/fo/2483phhkr2gkl54nikcid/AAi5g_w9FmtTbxu4hzws7cU?rlkey=e9gpltd025htre8docdiwn7l6&st=hacwcwuk&dl=0',
  },
  {
    name: '573',
    uploads: [
      { label: 'Fotos', href: 'https://www.dropbox.com/request/RJhfmuHzXw47n06YnFeD' },
      { label: 'Derrotas', href: 'https://www.dropbox.com/request/8SCyQGXTkj6uZzaKV5Pk' },
      { label: 'Logs AIS', href: 'https://www.dropbox.com/request/lXm2YrPKfAjjSmcDOKeX' },
    ],
    folder: 'https://www.dropbox.com/scl/fo/7pq6hyvj13tl5ogxjdbpx/ALOBDQayLmWXXbKYMMGZBtc?rlkey=nfg0gi8xk65e7qrg0hlq080yz&st=i15iqi4w&dl=0',
  },
  {
    name: '574',
    uploads: [
      { label: 'Fotos', href: 'https://www.dropbox.com/request/ZOBT3wHrNrPL32fmXhoV' },
      { label: 'Derrotas', href: 'https://www.dropbox.com/request/9NHTNEtwjcxW1wLkXKS2' },
      { label: 'Logs AIS', href: 'https://www.dropbox.com/request/F93TyIf8YVCU9AGPiTn3' },
    ],
    folder: 'https://www.dropbox.com/scl/fo/pe9g0zywomesi5ugg08j6/ALE-3fwYsBD0QkYqRdx1bws?rlkey=3k2a44abdav4paqzhj1u0z34r&st=w0z98ktd&dl=0',
  },
  {
    name: 'BOYERO',
    uploads: [
      { label: 'Fotos', href: 'https://www.dropbox.com/request/JXaIzPVmU2wwvYOPiqCd' },
      { label: 'Derrotas', href: 'https://www.dropbox.com/request/gkbQ2b42UOGxKDjgGbzV' },
      { label: 'Logs AIS', href: 'https://www.dropbox.com/request/SbHZET0MNNVYJy39qHKZ' },
    ],
    folder: 'https://www.dropbox.com/scl/fo/jxav6djqm8665o7glcaqp/AAerciAsN2HWOU9Ktbzwy8w?rlkey=7hrzdeob2axotnlz7o32fp8dt&st=y0783ld5&dl=0',
  },
  {
    name: 'CHARRÚA',
    uploads: [
      { label: 'Fotos', href: 'https://www.dropbox.com/request/ydQMD2lsHp5BpBYCjiPW' },
      { label: 'Derrotas', href: 'https://www.dropbox.com/request/WaBwReQdi5BA4UyTg87M' },
      { label: 'Logs AIS', href: 'https://www.dropbox.com/request/7AB7tGngkdHasQw9qmz6' },
    ],
    folder: 'https://www.dropbox.com/scl/fo/91dh1wu46fvwbdrghodz5/AFc6TBvupj4T6CgpyHFNUKE?rlkey=w98sh39vg64gfoliy6yhbmq7t&st=2cgzhcp4&dl=0',
  },
  {
    name: 'DON OSVALDO',
    uploads: [
      { label: 'Fotos', href: 'https://www.dropbox.com/request/ZDi3abjZtiJFpDuzf6pn' },
      { label: 'Derrotas', href: 'https://www.dropbox.com/request/bBxJwTIBzcRDWxO0nera' },
      { label: 'Logs AIS', href: 'https://www.dropbox.com/request/UX1Yutx3pNoBT4k4HUVG' },
    ],
    folder: 'https://www.dropbox.com/scl/fo/lj2k5g32muogigs4zazxz/AIsBDpzhAtGqXR7yJjdRawg?rlkey=xcij4kgh3mzd66oa0j5new3yx&st=lasulkg7&dl=0',
  },
  {
    name: 'KAWAI',
    uploads: [
      { label: 'Fotos', href: 'https://www.dropbox.com/request/aIc85uLFNVWfLBenE0EF' },
      { label: 'Derrotas', href: 'https://www.dropbox.com/request/PNuQpm2MPolfPn49heYl' },
      { label: 'Logs AIS', href: 'https://www.dropbox.com/request/0kZ6dztGs3xZGseBbyGf' },
    ],
    folder: 'https://www.dropbox.com/scl/fo/o3o9vj49shelikdkgj6ex/ADuvVq7OBF8K5n3De13rK58?rlkey=afj446hyxd48u2e3iqxgv4u7u&st=s0t5ha45&dl=0',
  },
];

const logsResources = [
  { label: 'ShipPlotter', href: 'https://www.dropbox.com/scl/fo/bplsn1cuamhum8ay4rs7o/h?dl=0' },
  { label: 'AIS Server', href: 'https://www.dropbox.com/scl/fo/jsl4j4kbv9bchmy0vurta/h?dl=0' },
];

const ResourceLink = ({ href, children, folder = false }) => (
  <a
    className={`enlaces-resource-link${folder ? ' is-folder' : ''}`}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {folder ? <FiFolder aria-hidden="true" /> : <FiUploadCloud aria-hidden="true" />}
    {children}
    <FiArrowUpRight aria-hidden="true" />
  </a>
);

ResourceLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  folder: PropTypes.bool,
};

const DropboxBackup = () => (
  <div className="enlaces-page">
    <main className="enlaces-content">
      <Link className="enlaces-back-link" to="/dashEnlaces">
        <FiArrowLeft aria-hidden="true" />
        Todos los accesos
      </Link>

      <section className="enlaces-page-hero enlaces-dropbox-hero">
        <div>
          <span className="enlaces-eyebrow">Archivos · Dropbox</span>
          <h1>Backups de embarcaciones</h1>
          <p>Elegí una embarcación para cargar archivos o consultar la carpeta compartida.</p>
        </div>
        <figure className="enlaces-dropbox-figure">
          <img src={enlacesBackupImg} alt="Instructivo para cargar archivos en Dropbox" />
        </figure>
      </section>

      <section className="enlaces-dropbox-section" aria-labelledby="enlaces-vessels-title">
        <div className="enlaces-main-heading">
          <span className="enlaces-eyebrow">Carga y consulta</span>
          <h2 id="enlaces-vessels-title">Archivos por embarcación</h2>
          <p>Seleccioná el tipo de archivo para cargarlo, o abrí la carpeta para consultar los archivos existentes.</p>
        </div>
        <div className="enlaces-vessel-grid">
          {vesselResources.map(({ name, uploads, folder }) => (
            <article className="enlaces-vessel-card" key={name}>
              <h3>{name}</h3>
              <span className="enlaces-resource-label">Cargar archivos</span>
              <div className="enlaces-resource-list">
                {uploads.map(({ label, href }) => (
                  <ResourceLink href={href} key={label}>{label}</ResourceLink>
                ))}
                <ResourceLink href={folder} folder>Consultar carpeta</ResourceLink>
              </div>
            </article>
          ))}
          <article className="enlaces-vessel-card">
            <h3>Logs AIS Server y ShipPlotter</h3>
            <p>Carga de datos a cargo de Tomás Moren.</p>
            <span className="enlaces-resource-label">Consultar datos</span>
            <div className="enlaces-resource-list">
              {logsResources.map(({ label, href }) => (
                <ResourceLink href={href} key={label}>{label}</ResourceLink>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
);

export default DropboxBackup;
