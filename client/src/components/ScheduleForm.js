import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedule } from '../features/scheduleSlice';
import './App.css';

function ScheduleForm() {
  const [dailyDemand, setDailyDemand] = useState([0, 0, 0, 0, 0, 0, 0]);
  const dispatch = useDispatch();
  const scheduleData = useSelector((state) => state.schedule.scheduleData);
  const additionalResources = useSelector((state) => state.schedule.additionalResources);
  const error = useSelector((state) => state.schedule.error);

  const handleInputChange = (e, index) => {
    const newDailyDemand = [...dailyDemand];
    newDailyDemand[index] = Number(e.target.value);
    setDailyDemand(newDailyDemand);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting daily demand:', dailyDemand);
    await dispatch(fetchSchedule(dailyDemand));
  };

  return (
    <div>
      <h1>Schedule Generator</h1>
      {error && <p className="error">Error: {error}</p>}
      <form onSubmit={handleSubmit} className="formContainer">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
          <div key={day}>
            <label>
              {day}:
              <input
                type="number"
                value={dailyDemand[index]}
                onChange={(e) => handleInputChange(e, index)}
              />
            </label>
          </div>
        ))}
        <button type="submit">Generate Schedule</button>
      </form>

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
        <div className="resourcesContainer">
          <h2 className="resourcesTitle">Additional Resources</h2>
          <ul className="resourcesList">
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
