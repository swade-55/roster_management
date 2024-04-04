import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedule } from '../features/scheduleSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function ScheduleForm() {
  const dispatch = useDispatch();
  const scheduleData = useSelector((state) => state.schedule.scheduleData);
  const additionalResources = useSelector((state) => state.schedule.additionalResources);
  const error = useSelector((state) => state.schedule.error);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const validationSchema = Yup.object().shape({
    dailyDemand: Yup.array()
      .of(Yup.number().min(0, 'Demand must be greater than or equal to 0').required('Required'))
      .required('All days are required')
      .length(7, 'There must be a demand for each day of the week'),
  });

  const initialValues = {
    dailyDemand: [0, 0, 0, 0, 0, 0, 0],
  };

  const handleSubmit = async (values) => {
    await dispatch(fetchSchedule(values.dailyDemand));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Schedule Generator</h1>
      {error && <p className="text-error">Error: {error}</p>}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="formContainer">
            {daysOfWeek.map((day, index) => (
              <div key={day} className="form-control mb-3">
                <label className="label">
                  <span className="label-text">{day}:</span>
                </label>
                <Field
                  type="number"
                  name={`dailyDemand.${index}`}
                  className={`input input-bordered input-primary w-full ${
                    errors.dailyDemand?.[index] && touched.dailyDemand?.[index] ? 'input-error' : ''
                  }`}
                />
                <ErrorMessage name={`dailyDemand.${index}`} component="div" className="text-error" />
              </div>
            ))}
            <button type="submit" className="btn btn-primary mt-3">Generate Schedule</button>
          </Form>
        )}
      </Formik>

      {/* Display the schedules */}
      {scheduleData && (
        <div>
          <h2>Schedules</h2>
          <table className="scheduleTable">
            <thead>
              <tr>
                <th>Schedule Name</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
                <th>Sunday</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scheduleData).map(([scheduleName, scheduleDetails]) => (
                <tr key={scheduleName}>
                  <td>{scheduleName}</td>
                  {scheduleDetails.schedule.map((day, index) => (
                    <td key={index}>{day === 1.0 ? scheduleDetails.count : '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Display the additional resources */}
      {additionalResources && (
        <div>
          <h2>Additional Resources</h2>
          <ul>
            {additionalResources.map((resource, index) => (
              <li key={index}>Day {index + 1}: {resource}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


export default ScheduleForm;
