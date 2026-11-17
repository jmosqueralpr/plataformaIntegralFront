import React from "react";
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">DYB</span>
        <p className="footerText">
          Desarrollado por
          <a href="mailto:jmosqueralpr@gmail.com"> jmosquera</a>
        </p>
        <span className="footer-divider">•</span>
        <span className="footer-meta">2026</span>
      </div>
    </footer>
  );
};

export default Footer;
