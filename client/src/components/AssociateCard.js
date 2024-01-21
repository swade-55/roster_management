import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteWorker, updateAssociate, fetchWorkers } from '../features/workersSlice';
import {fetchMetrics} from '../features/metricsSlice';
import Metric from './Metric';

function AssociateCard({ worker }) {

  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(worker.first_name);
  const [lastName, setLastName] = useState(worker.last_name);
  const [metrics, setMetrics] = useState(worker.metrics.map(metric => ({
    id: metric.id, // Ensure the metric ID is included
    value: metric.value
  })));
  

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

  // function handleUpdate() {
  //   const updatedData = {
  //     associateId: worker.id,
  //     firstName: firstName,
  //     lastName: lastName,
  //     metrics: metrics.map(metric => ({
  //       id: metric.id, // Include the metric ID
  //       value: parseInt(metric.value, 10) // Ensure value is an integer
  //     }))
  //   };
  
  //   dispatch(updateAssociate(updatedData))
  //     .unwrap()
  //     .then(response => {
  //       console.log('Update successful:', response);
  //       console.log('Updated data sent:', updatedData);
  //       setEditMode(false);
  //       // Update local state if necessary, e.g., refresh worker data
  //     })
  //     .catch(error => {
  //       console.error('Error updating associate:', error);
  //     });
  // }

  function handleUpdate() {
    const updatedData = {
      associateId: worker.id,
      firstName: firstName,
      lastName: lastName,
      metrics: metrics 
    };
  

    dispatch(updateAssociate(updatedData))
      .unwrap()
      .then(response => {
        console.log('Update successful:', response);
        dispatch(fetchWorkers()); //forced refresh of workers
        setEditMode(false);
      })
      .catch(error => {
        console.error('Error updating associate:', error);
      });
  }
  

  // function handleMetricChange(index, value) {
  //   console.log(`Metric change - Index: ${index}, Value: ${value}`);
  //   const newMetrics = metrics.map((metric, i) => {
  //     if (i === index) {
  //       return { ...metric, value };
  //     }
  //     return metric;
  //   });
  //   console.log('Updated metrics in local state:', newMetrics);
  //   setMetrics(newMetrics);
  // }

  function handleMetricChange(metricId, newValue) {
    console.log(`Metric change - Metric ID: ${metricId}, New Value: ${newValue}`);
    // Map over the metrics and update the value where the id matches
    const newMetrics = metrics.map(metric => {
      if (metric.id === metricId) {
        return { ...metric, value: parseInt(newValue, 10) };
      }
      return metric;
    });
    console.log('Updated metrics in local state:', newMetrics);
    setMetrics(newMetrics);
  }
  

  // const metricInputs = metrics.map((metric, index) => (
  //   <input
  //     key={index}
  //     type="number"
  //     value={metric.value}
  //     onChange={e => handleMetricChange(index, e.target.value)}
  //   />
  // ));

  const metricInputs = metrics.map((metric, index) => (
    <input
      key={index}
      type="number"
      value={metric.value}
      onChange={e => handleMetricChange(metric.id, e.target.value)}
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
