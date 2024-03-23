import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteWorker, updateAssociate } from '../features/workersSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function AssociateCard({ worker }) {

  const cardStyle = {
    position: 'relative', // Use relative for z-index to work
    marginBottom: '20px', // Add some space between the cards
    paddingBottom: '70px', // Increase padding at the bottom to ensure space for buttons
    border: '1px solid #ccc', // Add border for visual separation (optional)
    borderRadius: '4px', // Border radius to match the UI style (optional)
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Box shadow for a subtle depth effect (optional)
    backgroundColor: '#fff', // White background for the card
  };

  // Style for the metrics container to prevent overlap
  const metricsContainerStyle = {
    overflow: 'hidden', // Prevent content from spilling out
    paddingBottom: '10px', // Add some padding at the bottom for a cleaner look
  };

  // Existing buttonContainerStyle remains the same
  const buttonContainerStyle = {
    position: 'absolute', // Position buttons at the bottom of the card
    bottom: '10px', // Spacing from the bottom
    left: '10px', // Spacing from the left
    zIndex: 2, // Ensure it's above other content
  };


  const metricNameToId = {
    PalletsPerHour: 1,
    Uptime: 2,
    Attendance: 3,
    CasesPerHour: 4,
  };
  
  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    metrics: Yup.array().of(
      Yup.object({
        id: Yup.string().required('ID is required'),
        value: Yup.number().required('Value is required').positive('Value must be positive')
      })
    )
  });
  
  
  
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);

  
  

  const formik = useFormik({
    initialValues: {
      firstName: worker.first_name,
      lastName: worker.last_name,
      metrics: Object.entries(worker.metrics).map(([key, value]) => ({
        id: metricNameToId[key], // The mapping is correct here
        value: value
      })),
    },
    validationSchema,
    onSubmit: (values) => {
      const updatedData = {
        associateId: worker.id,
        firstName: values.firstName,
        lastName: values.lastName,
        metrics: values.metrics.map(metric => {
          const metricID = metricNameToId[metric.id] || metric.id; // Fallback to metric.id in case mapping fails
          return {
            metric_id: metricID,
            value: metric.value
          };
        }),
      };
      console.log('Dispatching updateAssociate with data:', updatedData);
      dispatch(updateAssociate(updatedData))
        .unwrap()
        .then((response) => {
          setEditMode(false); // Turn off edit mode on successful update
        })
        .catch(error => {
          console.error('Error updating associate:', error);
        });
    },
  });

  

  function handleWorkerDelete() {
      dispatch(deleteWorker(worker.id));
  }



  return (
    <div className="ui card" style={cardStyle}>
  {editMode ? (
    // Form view for editing
    <form onSubmit={formik.handleSubmit} className="ui form">
      <div className="field">
        <label>First Name</label>
        <input
          type="text"
          {...formik.getFieldProps('firstName')}
        />
        {/* Error Message */}
      </div>
      <div className="field">
        <label>Last Name</label>
        <input
          type="text"
          {...formik.getFieldProps('lastName')}
        />
        {/* Error Message */}
      </div>
      {/* Metrics Editing Fields */}
      {formik.values.metrics.map((metric, index) => (
        <div key={metric.id} className="field">
          <label htmlFor={`metrics.${index}.value`}>{metric.id}</label>
          <input
            type="number"
            {...formik.getFieldProps(`metrics.${index}.value`)}
          />
          {/* Error Message for Each Metric */}
        </div>
      ))}
          <div style={buttonContainerStyle}>
            <button type="submit" className="ui button primary">Save</button>
            <button
              type="button" // Changed from submit to button
              onClick={handleWorkerDelete} // Added onClick event handler
              className="ui button red">Delete</button>
            <button type="button" onClick={() => setEditMode(false)} className="ui button">Cancel</button>
      </div>
    </form>
  ) : (
    // View mode displaying associate information
    <>
      <div className="header">{worker.first_name} {worker.last_name}</div>
      <div className="meta">{worker.job_class}</div>
      <div className="description" style={metricsContainerStyle}>
        <h4 className="ui sub header">Metrics</h4>
        <div className="ui small feed">
          {Object.entries(worker.metrics).map(([key, value], index) => (
            <div key={index} className="event">
              <div className="content">
                <div className="summary">
                  {key}: {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={buttonContainerStyle}>
      <button onClick={() => setEditMode(true)} className="ui button">Edit</button>
      </div>
    </>
  )}
</div>

  );
}

export default AssociateCard;
