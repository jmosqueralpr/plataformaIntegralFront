const CampaignYearsBar = ({ campaigns }) => {
  return (
    <div className="years-bar">
      {campaigns.map(c => (
        <button key={c._id} className="year-btn">
          {c.anio}
        </button>
      ))}
    </div>
  );
};

export default CampaignYearsBar;
