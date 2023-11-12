// AssociateCard.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteWorker } from '../features/workersSlice';
import Metric from './Metric'; // Import the Metric component

function AssociateCard({ worker }) {
  const dispatch = useDispatch();

  function handleWorkerDelete() {
    fetch(`http://localhost:5555/associate_metrics/${worker.id}`, {
      method: 'DELETE',
    })
    .then(r => r.json())
    .then(data => {
      dispatch(deleteWorker(worker.id));
    });
  }

  // Map over the metrics array and render a Metric component for each one
  const metricCards = worker.metrics.map((metric, index) => (
    <Metric key={index} metric={metric} />
  ));

  return (
    <div className="ui card">
      <div className="content">
        <div className="header">{worker.first_name} {worker.last_name}</div>
        <div className="meta">{worker.job_class}</div>
      </div>
      <div className="content">
        <h4 className="ui sub header">Metrics</h4>
        <div className="ui small feed">
          {metricCards} {/* Render the metric cards here */}
        </div>
      </div>
      <div className="extra content">
        <button onClick={handleWorkerDelete} className="ui button">Delete</button>
      </div> 
    </div>
  );
}

export default AssociateCard;
