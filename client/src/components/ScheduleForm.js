import React, { useState, useEffect } from 'react';
import { Button, Form, Table } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedule } from '../features/scheduleBuildSlice';

function ScheduleForm() {
  const [inputValues, setInputValues] = useState({
    sunday: 12,
    monday: 13,
    tuesday: 14,
    wednesday: 15,
    thursday: 16,
    friday: 17,
    // ... other days
  });
  const dispatch = useDispatch();

  // This will hold the fetched schedule once available
  const schedule = useSelector((state) => state.scheduleBuilder.data);

  useEffect(() => {
    console.log('Component mounted. Dispatching fetchSchedule with initial values.');
    // Dispatch fetchSchedule action when the component mounts
    dispatch(fetchSchedule(inputValues));
  }, [dispatch, inputValues]);

  const handleSliderChange = (name, value) => {
    setInputValues({ ...inputValues, [name]: value });
  };

  const handleSubmit = () => {
    console.log('Submitting user input for schedule generation:', inputValues);
    dispatch(fetchSchedule(inputValues));
  };

  const scheduleData = useSelector((state) => state.scheduleBuilder.data);


  // Define a function to render the schedule table
  function ScheduleTable({ schedule }) {
    // The data prop passed to ScheduleTable contains the entire object including status and total_staff.
    // You need to access the 'schedule' key of this object to get the shifts.
    const shiftData = schedule.schedule;
  
    // Log the shift data to confirm it's what you expect
    console.log('Shift data:', shiftData);
  
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
    // Map over the days array to create table rows
    const scheduleRows = days.map((day) => ({
      day,
      staff: shiftData[`Shift for ${day}`] || 0 // Use || 0 to default to 0 if undefined
    }));
  
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Shift</Table.HeaderCell>
            {days.map((day) => <Table.HeaderCell key={day}>{day}</Table.HeaderCell>)}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {scheduleRows.map((shift) => (
            <Table.Row key={shift.day}>
              <Table.Cell>{`Shift: ${shift.day}`}</Table.Cell>
              {days.map((day) => (
                <Table.Cell key={day}>{shift.day === day ? shift.staff : 0}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }
  
  

  function DisplaySchedule() {
    if (!schedule) return <div>No schedule data available.</div>;
  
    return (
      <div>
        <h3>Schedule Results:</h3>
        {/* Display schedule data here */}
        <ul>
          {Object.entries(schedule).map(([key, value]) => (
            <li key={key}>{`${key}: ${value}`}</li>
          ))}
        </ul>
      </div>
    );
  }
  

  // Update the return statement to include ScheduleTable
  return (
    <div>
      <Form>
      {/* Sunday Field */}
      <Form.Field>
        <label>Sunday Needs (heads)</label>
        <input
          type='range'
          min={1}
          max={100}
          value={inputValues.sunday}
          onChange={(e) => handleSliderChange('sunday', parseInt(e.target.value))}
        />
      </Form.Field>

      {/* Monday Field */}
      <Form.Field>
        <label>Monday Needs (heads)</label>
        <input
          type='range'
          min={1}
          max={100}
          value={inputValues.monday}
          onChange={(e) => handleSliderChange('monday', parseInt(e.target.value))}
        />
      </Form.Field>

      {/* Tuesday Field */}
      <Form.Field>
        <label>Tuesday Needs (heads)</label>
        <input
          type='range'
          min={1}
          max={100}
          value={inputValues.tuesday}
          onChange={(e) => handleSliderChange('tuesday', parseInt(e.target.value))}
        />
      </Form.Field>

      {/* Wednesday Field */}
      <Form.Field>
        <label>Wednesday Needs (heads)</label>
        <input
          type='range'
          min={1}
          max={100}
          value={inputValues.wednesday}
          onChange={(e) => handleSliderChange('wednesday', parseInt(e.target.value))}
        />
      </Form.Field>

      {/* Thursday Field */}
      <Form.Field>
        <label>Thursday Needs (heads)</label>
        <input
          type='range'
          min={1}
          max={100}
          value={inputValues.thursday}
          onChange={(e) => handleSliderChange('thursday', parseInt(e.target.value))}
        />
      </Form.Field>

      {/* Friday Field */}
      <Form.Field>
        <label>Friday Needs (heads)</label>
        <input
          type='range'
          min={1}
          max={100}
          value={inputValues.friday}
          onChange={(e) => handleSliderChange('friday', parseInt(e.target.value))}
        />
      </Form.Field>
    </Form>
      <Button onClick={handleSubmit} primary>
        Generate Schedule
      </Button>
      <DisplaySchedule />
      {scheduleData && <ScheduleTable schedule={scheduleData} />}
    </div>
  );
}

export default ScheduleForm;

