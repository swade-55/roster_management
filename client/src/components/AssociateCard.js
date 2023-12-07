import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteWorker, updateWorker } from '../features/workersSlice';
import {fetchMetrics} from '../features/metricsSlice';
import Metric from './Metric';

function AssociateCard({ worker }) {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(worker.first_name);
  const [lastName, setLastName] = useState(worker.last_name);
  const [metrics, setMetrics] = useState(worker.metrics);

  function handleWorkerDelete() {
    fetch(`http://localhost:5555/associate_metrics/${worker.id}`, {
      method: 'DELETE',
    })
    .then(r => r.json())
    .then(data => {
      dispatch(deleteWorker(worker.id));
      dispatch(fetchMetrics())
    });
  }

  function handleUpdate() {
    fetch('http://localhost:5555/update_associate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        associateId: worker.id,
        firstName,
        lastName,
        metrics, // Ensure this is an array of objects, each with 'id' and 'value' fields
      }),
    })
    .then(response => response.json())
    .then(data => {
      dispatch(updateWorker({ id: worker.id, firstName, lastName, metrics }));
      setEditMode(false);
    })
    .catch(error => {
      console.error('Error updating associate:', error);
    });
  }
  

  function handleMetricChange(index, value) {
    const newMetrics = metrics.map((metric, i) => {
      if (i === index) {
        return { ...metric, value };
      }
      return metric;
    });
    setMetrics(newMetrics);
  }

  const metricInputs = metrics.map((metric, index) => (
    <input
      key={index}
      type="number"
      value={metric.value}
      onChange={e => handleMetricChange(index, e.target.value)}
    />
  ));

  return (
    <div className="ui card">
      <div className="content">
        {editMode ? (
          <div className="ui form">
            <div className="field">
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Metrics</label>
              {metricInputs}
            </div>
            <button onClick={handleUpdate} className="ui button primary">Save</button>
            <button onClick={() => setEditMode(false)} className="ui button">Cancel</button>
          </div>
        ) : (
          <>
            <div className="header">{firstName} {lastName}</div>
            <div className="meta">{worker.job_class}</div>
            <div className="content">
              <h4 className="ui sub header">Metrics</h4>
              <div className="ui small feed">
                {worker.metrics.map((metric, index) => (
                  <Metric key={index} metric={metric} />
                ))}
              </div>
            </div>
            <button onClick={() => setEditMode(true)} className="ui button">Edit</button>
          </>
        )}
      </div>
      <div className="extra content">
        <button onClick={handleWorkerDelete} className="ui button">Delete</button>
      </div> 
    </div>
  );
}

export default AssociateCard;
