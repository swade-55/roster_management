import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteWorker, updateAssociate } from '../features/workersSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function AssociateCard({ worker }) {



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
        id: metricNameToId[key], 
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
          const metricID = metricNameToId[metric.id] || metric.id; 
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
    <div className="card bg-base-100 shadow-xl">
  {editMode ? (
    <form onSubmit={formik.handleSubmit} className="card-body">
      <div className="form-control">
        <label className="label">
        <span className="label-text">First Name</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
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
          <div className="card-actions justify-end">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" onClick={() => handleWorkerDelete(worker.id)} className="btn btn-error">Delete</button>
            <button type="button" onClick={() => setEditMode(false)} className="btn btn-secondary">Cancel</button>
          </div>
    </form>
  ) : (
    // View mode displaying associate information
    <>
      <div className="header">{worker.first_name} {worker.last_name}</div>
      <div className="meta">{worker.job_class}</div>
      <div className="description">
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
      <div >
      <button onClick={() => setEditMode(true)} className="ui button">Edit</button>
      </div>
    </>
  )}
</div>

  );
}

export default AssociateCard;
