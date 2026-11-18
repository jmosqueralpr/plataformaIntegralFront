import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';

export function DashboardCard({ title = 'titleXD', link = 'linkXD', text = 'textXD', icon: Icon }) {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/' + link);
  };

  return (
    <div
      onClick={handleNavigation}
      className="section-box"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleNavigation()}
    >
      <div className="card-top-row">
        <div className="card-title-group">
          {Icon && <Icon className="card-icon" />}
          <h2 className="title-card">{title}</h2>
        </div>
        <FiArrowUpRight className="card-arrow" />
      </div>
      <p className="text-card">{text}</p>
    </div>
  );
}
