import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { addWorker } from '../features/workersSlice';

function AssociateForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    uptime: '',
    casesPerHour: '',
    attendance: '',
    jobClass: '',
  });

  const dispatch = useDispatch();

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(addWorker(formData)); // Dispatch the action to add a worker
    // Reset formData after submission
    setFormData({
      firstName: '',
      lastName: '',
      uptime: '',
      casesPerHour: '',
      attendance: '',
      jobClass: '',
    });
  }

  return (
    <div>
      <h3>Add an Associate!</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="field" widths="equal">
          <Form.Select
            fluid
            label="Job Class"
            options={[
              { key: 'selector', value: 'Selector', text: 'Selector' },
              { key: 'forklift', value: 'Forklift', text: 'Forklift' },
              { key: 'receiver', value: 'Receiver', text: 'Receiver' },
              { key: 'loader', value: 'Loader', text: 'Loader' },
              // ... Add other job class options here ...
            ]}
            placeholder="Select a Job Class"
            name="jobClass"
            value={formData.jobClass}
            onChange={(e, { value }) => setFormData({ ...formData, jobClass: value })}
          />

          {/* Conditional Rendering based on the job class */}
          {['Selector', 'Forklift', 'Receiver', 'Loader'].includes(formData.jobClass) && (
            <>
              <Form.Input
                fluid
                label="First Name"
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              <Form.Input
                fluid
                label="Last Name"
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              <Form.Input
                fluid
                label="Uptime"
                placeholder="Uptime"
                name="uptime"
                value={formData.uptime}
                onChange={handleChange}
              />
              {/* The following field should be conditional based on the jobClass */}
              {formData.jobClass === 'Selector' ? (
                <Form.Input
                  fluid
                  label="Cases Per Hour"
                  placeholder="Cases Per Hour"
                  name="casesPerHour"
                  value={formData.casesPerHour}
                  onChange={handleChange}
                />
              ) : (
                <Form.Input
                  fluid
                  label={formData.jobClass === 'Selector' ? "Cases Per Hour" : "Pallets Per Hour"}
                  placeholder={formData.jobClass === 'Selector' ? "Cases Per Hour" : "Pallets Per Hour"}
                  name={formData.jobClass === 'Selector' ? "casesPerHour" : "palletsPerHour"}
                  value={formData.jobClass === 'Selector' ? formData.casesPerHour : formData.palletsPerHour}
                  onChange={handleChange}
                />
              )}
              <Form.Input
                fluid
                label="Attendance"
                placeholder="Attendance"
                name="attendance"
                value={formData.attendance}
                onChange={handleChange}
              />
            </>
          )}

        </Form.Group>

        <Form.Button>Submit</Form.Button>
      </Form>
    </div>
  );
}

export default AssociateForm;
