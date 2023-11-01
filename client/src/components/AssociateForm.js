import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { addWorker } from '../features/workersSlice';

function AssociateForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName:'',
    uptime: '',
    casesPerHour: '',
    attendance: '',
    image: '',
    jobClass: '', // Added jobClass to formData
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
    dispatch(addWorker(formData)); // Assuming this remains unchanged
    // reset formData after submission if needed
    setFormData({
      name: '',
      uptime: '',
      casesPerHour: '',
      attendance: '',
      image: '',
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
          {formData.jobClass === 'Selector' && (
            <>
              <Form.Input
                type="text"
                fluid
                label="First Name"
                placeholder="First Name"
                name="firstname"
                value={formData.firstName}
                onChange={handleChange}
              />
              <Form.Input
                type="text"
                fluid
                label="Last Name"
                placeholder="Last Name"
                name="lastname"
                value={formData.lastName}
                onChange={handleChange}
              />
              <Form.Input
                type="text"
                fluid
                label="Uptime"
                placeholder="Uptime"
                name="uptime"
                value={formData.uptime}
                onChange={handleChange}
              />
              <Form.Input
                type="text"
                fluid
                label="Cases Per Hour"
                placeholder="Cases Per Hour"
                name="casesPerHour"
                value={formData.casesPerHour}
                onChange={handleChange}
              />
              <Form.Input
                type="text"
                fluid
                label="Attendance"
                placeholder="Attendance"
                name="attendance"
                value={formData.attendance}
                onChange={handleChange}
              />
              <Form.Input
                type="text"
                fluid
                label="Image"
                placeholder="Image URL"
                name="image"
                value={formData.image}
                onChange={handleChange}
              />
              <Form.Select
            fluid
            label="Job Class"
            options={[
              { key: 'teamselector', value: 'Team Selector', text: 'Team Selector' },
              { key: 'traineeselector', value: 'Trainee Selector', text: 'Trainee Selector' },
              { key: 'incentiveselector', value: 'Incentive Selector', text: 'Incentive Selector' },
              // ... Add other job class options here ...
            ]}
            placeholder="Select a Job Class"
            name="jobClass"
            value={formData.jobClass}
            onChange={(e, { value }) => setFormData({ ...formData, jobClass: value })}
          />
            </>
          )}

          {/* Example for another JobClass - Extend as needed */}
          {formData.jobClass === 'Forklift' && (
            <>
            <Form.Input
                type="text"
                fluid
                label="First Name"
                placeholder="First Name"
                name="firstname"
                value={formData.firstName}
                onChange={handleChange}
              />
              <Form.Input
                type="text"
                fluid
                label="Last Name"
                placeholder="Last Name"
                name="lastname"
                value={formData.lastName}
                onChange={handleChange}
              />
            <Form.Input
              type="text"
              fluid
              label="Uptime"
              placeholder="Uptime"
              name="uptime"
              value={formData.uptime}
              onChange={handleChange}
            />
            <Form.Input
              type="text"
              fluid
              label="Pallets Per Hour"
              placeholder="Pallets Per Hour"
              name="palletsPerHour"
              value={formData.palletsPerHour}
              onChange={handleChange}
            />
            <Form.Input
              type="text"
              fluid
              label="Attendance"
              placeholder="Attendance"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
            />
            <Form.Input
              type="text"
              fluid
              label="Image"
              placeholder="Image URL"
              name="image"
              value={formData.image}
              onChange={handleChange}
            />
          </>
          )}

{formData.jobClass === 'Loader' && (
            <>
            <Form.Input
                type="text"
                fluid
                label="First Name"
                placeholder="First Name"
                name="firstname"
                value={formData.firstName}
                onChange={handleChange}
              />
              <Form.Input
                type="text"
                fluid
                label="Last Name"
                placeholder="Last Name"
                name="lastname"
                value={formData.lastName}
                onChange={handleChange}
              />
            <Form.Input
              type="text"
              fluid
              label="Uptime"
              placeholder="Uptime"
              name="uptime"
              value={formData.uptime}
              onChange={handleChange}
            />
            <Form.Input
              type="text"
              fluid
              label="Pallets Per Hour"
              placeholder="Pallets Per Hour"
              name="palletsPerHour"
              value={formData.palletsPerHour}
              onChange={handleChange}
            />
            <Form.Input
              type="text"
              fluid
              label="Attendance"
              placeholder="Attendance"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
            />
            <Form.Input
              type="text"
              fluid
              label="Image"
              placeholder="Image URL"
              name="image"
              value={formData.image}
              onChange={handleChange}
            />
          </>
          )}

{formData.jobClass === 'Receiver' && (
            <>
            <Form.Input
                type="text"
                fluid
                label="First Name"
                placeholder="First Name"
                name="firstname"
                value={formData.firstName}
                onChange={handleChange}
              />
              <Form.Input
                type="text"
                fluid
                label="Last Name"
                placeholder="Last Name"
                name="lastname"
                value={formData.lastName}
                onChange={handleChange}
              />
            <Form.Input
              type="text"
              fluid
              label="Uptime"
              placeholder="Uptime"
              name="uptime"
              value={formData.uptime}
              onChange={handleChange}
            />
            <Form.Input
              type="text"
              fluid
              label="Pallets Per Hour"
              placeholder="Pallets Per Hour"
              name="palletsPerHour"
              value={formData.palletsPerHour}
              onChange={handleChange}
            />
            <Form.Input
              type="text"
              fluid
              label="Attendance"
              placeholder="Attendance"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
            />
            <Form.Input
              type="text"
              fluid
              label="Image"
              placeholder="Image URL"
              name="image"
              value={formData.image}
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
