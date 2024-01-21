import React from 'react';

function Metric({ metric }) {
  return (
    <div className="metric-card">
      <div className="content">
        <div className="summary">
          <strong>{metric.metric_name}:</strong> {metric.value}
        </div>
      </div>
    </div>
  );
}

export default Metric;
